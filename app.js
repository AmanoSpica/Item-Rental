import express from 'express';

const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));
app.use(express.static('public'));


const items = [
	{ itemNum: 1, itemName: 'スパナ' },
	{ itemNum: 2, itemName: 'ハンマー' },
];

const classList = [
	{ name: '1組', num: 1 },
	{ name: '2組', num: 2 },
	{ name: '3組', num: 3 },
	{ name: '4組', num: 4 },
	{ name: '5組', num: 5 },
	{ name: '6組', num: 6 }
];




const itemNumToName = (data) => {
	// dataのitemNumを元にitemNameをオブジェクトに追加
	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < items.length; j++) {
			if (data[i].itemNum === items[j].itemNum) {
				data[i].itemName = items[j].itemName;
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
	// SQL INSERT処理
	console.log(req.body);
	const id = 4;
	res.redirect(`/list?message=貸出処理が完了しました！貸出番号は ${id} です。`);
});


app.get('/list', (req, res) => {
	const filter = req.query ? req.query : null;
	console.log(filter);

	// SQL SELECT処理
	if (filter != null) {
		if (filter.class == '0' && filter.item == '0') {
			console.log('全選択');
		} else if (filter.class != '0' && filter.item == '0') {
			console.log('クラスのみ選択');
		} else if (filter.class == '0' && filter.item != '0') {
			console.log('アイテムのみ選択');
		} else {
			console.log('両方選択');
		}
	} else {
		console.log('選択なし');
	}

	let data = [
		{
			dataNum: 1,
			itemNum: 1,
			itemPiece: 2,
			className: '2',
			lentTime: '2021-08-01 10:00'
		},
		{
			dataNum: 2,
			itemNum: 2,
			itemPiece: 1,
			className: '3',
			lentTime: '2021-08-02 10:00'
		}
	];
	data = itemNumToName(data);

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
	// SQL SELECT処理
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
	// SQL UPDATE処理
	console.log(req.params);
	// SQL SELECT処理
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