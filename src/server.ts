import express from 'express';
import { env } from '../env';
import { Liquid } from 'liquidjs';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { rootRouter } from './router/root';
import morgan from 'morgan';

const app = express();

app.engine('liquid', new Liquid().express());
app.set('views', './src/views');
app.set('view engine', 'liquid');

app.use(morgan('dev'));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', rootRouter);

app.listen(env.PORT, () => {
    console.log(`Listening on port ${env.PORT}...`);
});
