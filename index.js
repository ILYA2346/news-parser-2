const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

const { categories } = require('./config');

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/api/categories', (req, res) => {
    res.json(categories);
});

app.get('/:count/news/for/:category', async (req, res) => {
    const count = parseInt(req.params.count);
    const category = req.params.category;
    if (isNaN(count) || count <= 0) {
        return res.status(400).send('Ошибка: число должно быть положительным целым числом.');
    }

    const rssUrl = `https://www.vedomosti.ru/rss/rubric/${category}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    const options = {
        method: 'GET',
        url: apiUrl
    };

    axios(options)
        .then(apiResponse => {
            if (apiResponse.data.status !== 'ok') {
                throw new Error('API вернуло статус: ' + apiResponse.data.status);
            }
            const allNews = apiResponse.data.items;
            const selectedNews = allNews.slice(0, count);

            res.render('news', { 
                count: count,
                category: category,
                news: selectedNews 
            });
        })
        .catch(error => {
            console.error('Ошибка при получении новостей:', error.message);
            res.status(500).send('Ошибка при получении новостей.');
        })
        .then(() => {
            console.log('Запрос к API завершен.');

        });
});

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});