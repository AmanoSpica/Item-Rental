const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('public'));


app.get('/', (req, res) => {
	res.render('index.ejs');
});

app.get('/lent', (req, res) => {
	res.render('lent.ejs',
		{items:
			[
				{itemNum: 1, itemName: 'スパナ'},
				{itemNum: 2, itemName: 'ハンマー'},
			],
		}
	);
});

app.post('/lent', (req, res) => {
	console.log(req.body);
	res.redirect('/lent');
});

app.get('/return', (req, res) => {
	res.render('return.ejs');
});




app.listen(3000, () => {
	console.log('Server is running on port 3000');
});