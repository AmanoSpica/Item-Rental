const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('public'));


const items = [
	{itemNum: 1, itemName: 'スパナ'},
	{itemNum: 2, itemName: 'ハンマー'},
];



app.get('/', (req, res) => {
	res.render('index.ejs');
});

app.get('/lent', (req, res) => {
	res.render('lent.ejs',
		{items: items,
		message: null
		}
	);
});

app.post('/lent', (req, res) => {
	// SQL INSERT処理
	console.log(req.body);
	const message = 4;
	res.render('lent.ejs',
		{items: items,
		message: message
		}
	);
});


app.get('/list', (req, res) => {

	const data = [
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
	// dataのitemNumを元にitemNameをオブジェクトに追加
	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < items.length; j++) {
			if (data[i].itemNum === items[j].itemNum) {
				data[i].itemName = items[j].itemName;
			}
		}
	}
	res.render('list.ejs',
		{
			data: data,
			items: items,
			message: null
		}
	)
});

app.post('/return/:id', (req, res) => {
	// SQL UPDATE処理
	console.log(req.params);
	const data = [];
	res.render('list.ejs',
		{
			data: data,
			items: items,
			message: null
		}
	)
});




app.listen(3000, () => {
	console.log('Server is running on port 3000');
});