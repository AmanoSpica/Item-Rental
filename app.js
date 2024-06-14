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

const conn = connect({url: process.env.SQL_URL});

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


app.post('/lent', (req, res) => {
	// TODO SQL INSERT処理
	console.log(req.body);
	const id = 4;
	res.redirect(`/list?message=貸出処理が完了しました！貸出番号は ${id} です。`);
});


app.get('/list', async (req, res) => {
	const filter = req.query ? req.query : null;
	console.log(filter);
	let data = null;

	if (filter != null) {
		if (filter.class == '0' && filter.item == '0') {
			data = await conn.execute('SELECT * FROM LendingData ORDER BY id ASC;');

		} else if (filter.class != '0' && filter.item == '0') {
			data = await conn.execute(`SELECT * FROM LendingData WHERE class_num=${filter.class} ORDER BY id ASC;`);

		} else if (filter.class == '0' && filter.item != '0') {
			data = await conn.execute(`SELECT * FROM LendingData WHERE item_id=${filter.item} ORDER BY id ASC;`);

		} else {
			data = await conn.execute(`SELECT * FROM LendingData WHERE class_num=${filter.class} AND item_id=${filter.item} ORDER BY id ASC;`);

		}
	} else {
		data = await conn.execute('SELECT * FROM LendingData ORDER BY id ASC;');
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


app.get('/return-confirm/:id', (req, res) => {
	const id = req.params.id;
	// TODO SQL SELECT処理
	let data = [
		{
			dataNum: 1,
			itemNum: 1,
			itemPiece: 2,
			className: '2',
			lentTime: '2021-08-01 10:00'
		}
	];
	data = itemNumToName(data);

	res.render('return_confirm.ejs', { data: data[0] });
})


app.post('/return/:id', (req, res) => {
	// TODO SQL UPDATE処理
	console.log(req.params);
	// TODO SQL SELECT処理
	let data = [
		{
			dataNum: 1,
			itemNum: 1,
			itemPiece: 2,
			className: '2',
			lentTime: '2021-08-01 10:00'
		}
	];
	data = itemNumToName(data);

	res.redirect(`/list?message=貸出番号 ${req.params.id} を返却しました。`);
});




app.listen(3000, () => {
	console.log('Server is running on port 3000');
});