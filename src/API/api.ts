import axios from 'axios';
const SERVER_REMOTE_URL = "https://dev.ozvid.in/pin-point-eye-yii2-1667/api/"

// const API = axios.create({ baseURL: SERVER_REMOTE_URL });

export const GetService = (URL:string) => axios.get(`${URL}`);
export const PostService = (URL:string ,newPost:any) => axios.post(`${URL}`, newPost);
