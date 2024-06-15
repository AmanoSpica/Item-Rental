import { connect } from '@tidbcloud/serverless';
import dotenv from 'dotenv';
import express from 'express';

const app = express();
dotenv.config();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));
app.use(express.static('public'));

const conn = connect({ url: process.env.SQL_URL });

const items = await conn.execute('SELECT * FROM Items;')
const classList = await conn.execute('SELECT * FROM Classes;')


const itemNumToName = (data) => {
	// dataのitemNumを元にitemNameをオブジェクトに追加
	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < items.length; j++) {
			if (data[i].item_id === items[j].id) {
				data[i].item_name = items[j].item_name;
			}
		}
	}
	return data;
};

const classNumToName = (data) => {
	// dataのclassNameを元にclassNameをオブジェクトに追加
	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < classList.length; j++) {
			if (data[i].class_num === classList[j].id) {
				data[i].class_name = classList[j].name;
			}
		}
	}
	return data;
};




app.get('/', (req, res) => {
	res.render('index.ejs');
});


app.get('/lent', (req, res) => {
	const message = req.query.message ? req.query.message : null;

	res.render('lent.ejs',
		{ items: items, message: message }
	);
});


app.post('/lent', (req, res, next) => {
	if (req.body.itemPiece === '') {
		res.redirect('/lent?message=個数を入力してください。');
	} else {
		next();
	}
},
	async (req, res) => {
		console.log(req.body);
		const time = new Date();
		time.setHours(time.getHours() + 9);

		await conn.execute(
			`INSERT INTO LendingData (item_id, item_piece, class_num, lent_time) VALUES (${req.body.item}, ${req.body.itemPiece}, ${req.body.class}, '${time.toISOString()}');`
		)
		const result = await conn.execute('SELECT LAST_INSERT_ID();');
		res.redirect(`/list?message=貸出処理が完了しました！貸出番号は ${result[0]['LAST_INSERT_ID()']} です。`);
	});


app.get('/list', async (req, res) => {
	const filter = req.query ? req.query : null;
	let data = null;

	if (filter != null) {
		if (filter.class != '0' | filter.item != '0') {
			if (filter.class == '0' && filter.item != '0') {
				data = await conn.execute(`SELECT * FROM LendingData WHERE item_id=${filter.item} AND return_time IS NULL ORDER BY id ASC;`);
			} else if (filter.class != '0' && filter.item == '0') {
				data = await conn.execute(`SELECT * FROM LendingData WHERE class_num=${filter.class} AND return_time IS NULL ORDER BY id ASC;`);
			} else if (filter.class == '0' && filter.item == '0') {
				data = await conn.execute(`SELECT * FROM LendingData WHERE item_id=${filter.item} AND class_num=${filter.class} AND return_time IS NULL ORDER BY id ASC;`);
			} else {
				data = await conn.execute(`SELECT * FROM LendingData WHERE return_time IS NULL ORDER BY id ASC;`);
			}
		} else {
			data = await conn.execute(`SELECT * FROM LendingData WHERE return_time IS NULL ORDER BY id ASC;`);

		}
	} else {
		data = await conn.execute('SELECT * FROM LendingData WHERE return_time IS NULL ORDER BY id ASC;');
	}

	data = itemNumToName(data);
	data = classNumToName(data);

	const message = req.query.message ? req.query.message : null;

	res.render('list.ejs',
		{
			data: data,
			items: items,
			classList: classList,
			message: message
		}
	)
});


app.get('/return-confirm', (req, res, next) => {
	if (req.query.id === undefined) {
		res.redirect('/list');
	} else {
		next();
	}
},
	(req, res) => {
		const id = req.query.id;
		res.redirect(`/return-confirm/${id}`);
	});

app.get('/return-confirm/:id', async (req, res) => {
	const id = req.params.id;
	let data = await conn.execute(`SELECT * FROM LendingData WHERE id=${id};`);
	data = itemNumToName(data);
	data = classNumToName(data);

	res.render('return_confirm.ejs', { data: data[0] });
})


app.post('/return/:id', async (req, res) => {
	const time = new Date();
	time.setHours(time.getHours() + 9);
	await conn.execute(
		`UPDATE LendingData SET return_time='${time.toISOString()}' WHERE id=${req.params.id};`
	);

	res.redirect(`/list?message=貸出番号 ${req.params.id} を返却しました。`);
});




app.listen(3000, () => {
	console.log('Server is running on port 3000');
});