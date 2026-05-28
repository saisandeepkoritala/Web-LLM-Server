import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { searchRouter } from './routes/searchRouter';

const app = express();

app.use(cors({
    origin:process.env.ALLOWED_ORIGIN
}));
app.use(express.json());


app.use("/search",searchRouter);

app.listen(process.env.PORT,()=>{
    console.log("Server is running ",process.env.PORT)
});


