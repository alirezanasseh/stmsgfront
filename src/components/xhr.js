import axios from "axios";
import {Pagination} from "react-bootstrap";
import React from "react";

export default class xhr {
    constructor(parent, url, data = '', page = 1, token = '', perPage = 100, server = "base") {
        this.parent = parent;
        this.url = xhr.convertLetters(xhr.convertNumbers(url));
        let newData = data;
        if(typeof data === 'object') {
            for (let [key, value] of Object.entries(data)) {
                if (value === null) {
                    delete newData[key];
                    continue;
                }
                if(typeof value === "string") {
                    value = xhr.convertLetters(xhr.convertNumbers(value));
                }
                newData[key] = value;
            }
        }else{
            newData = xhr.convertLetters(xhr.convertNumbers(data));
        }
        this.data = newData;
        this.page = page;
        this.locale = global.config.LOCALE;
        if(token){
            this.token = token;
        }else{
            this.token = global.config.TOKEN;
        }
        this.perPage = perPage;
        switch(server){
            case "base":
                this.server = global.config.BASE_URL;
                break;
            case "log":
                this.server = global.config.LOG_URL;
                break;
            default:
                break;
        }
    }

    static convertLetters(value){
        let arabicLetters = ["ي", "ك"];
        let farsiLetters = ["ی", "ک"];
        let regex = '';
        for(let i = 0; i < 2; i++){
            regex = new RegExp(arabicLetters[i], "g");
            value = value.replace(regex, farsiLetters[i]);
        }
        return value;
    }

    static convertNumbers(value){
        let farsiNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
        let englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
        let regex = '';
        for(let i = 0; i < 10; i++){
            regex = new RegExp(farsiNumbers[i], "g");
            value = value.replace(regex, englishNumbers[i]);
        }
        return value;
    }

    handleExpiredToken(){
        localStorage.removeItem('smtoken');
        global.config.TOKEN = '';
        window.location = '/login';
    }

    GetOne(callback){
        axios.get(this.server + '/' + this.url + '/' + this.data +'?token=' + global.config.TOKEN + '&locale=' + this.locale).then(response => {
            if(response.status >= 200 && response.status < 300) {
                callback(response.data.data.item);
            }else{
                if(response.status === 401){
                    this.handleExpiredToken();
                }else {
                    console.error(response.data.note);
                }
            }
        }).catch(e => {
            if(e.message === "Request failed with status code 401"){
                this.handleExpiredToken();
            }
            if(e.response && e.response.data.note){
                callback({status: false, note: e.response.data.note});
            }else{
                console.log(e.message);
                callback({status: false, note: 'ارتباط با سرور برقرار نشد.'});
            }
        });
    }

    GetOneWithData(callback){
        axios.get(this.server + '/' + this.url + '/' + this.data +'&token=' + global.config.TOKEN + '&locale=' + this.locale).then(response => {
            if(response.status >= 200 && response.status < 300) {
                response.data.data.item["status"] = true;
                callback(response.data.data.item);
            }else{
                if(response.status === 401){
                    this.handleExpiredToken();
                }else {
                    console.error(response.data.note);
                }
            }
        }).catch(e => {
            if(e.message === "Request failed with status code 401"){
                this.handleExpiredToken();
            }
            if(e.response && e.response.data.note){
                callback({status: false, note: e.response.data.note});
            }else{
                console.log(e.message);
                callback({status: false, note: 'ارتباط با سرور برقرار نشد.'});
            }
        });
    }

    GetManyPure(callback){
        if(this.data){
            this.data = '&' + this.data;
        }
        let url = this.url + '?token=' + global.config.TOKEN + '&locale=' + this.locale + this.data;
        if(this.page > 0){
            url += '&page_size=' + this.perPage + '&page=' + this.page;
        }else{
            url += '&page_size=1000000&page=1';
        }
        axios.get(this.server + '/' + url).then(response => {
            if(response.status >= 200 && response.status < 300) {
                response.status = true;
                callback(response, this.url);
            }else{
                if(response.status === 401){
                    this.handleExpiredToken();
                }else {
                    console.error(response.data.note);
                }
            }
        }).catch(e => {
            if(e.message === "Request failed with status code 401"){
                this.handleExpiredToken();
            }
            if(e.response && e.response.data.note){
                callback({status: false, note: e.response.data.note});
            }else{
                console.log(e.message);
                callback({status: false, note: 'ارتباط با سرور برقرار نشد.'});
            }
        });
    }

    GetMany(callback){
        if(this.data){
            this.data = '&' + this.data;
        }
        let url = this.url + '?token=' + global.config.TOKEN + '&locale=' + this.locale + this.data;
        if(this.page > 0){
            url += '&page_size=' + this.perPage + '&page=' + this.page;
        }else{
            url += '&page_size=1000000&page=1';
        }
        axios.get(this.server + '/' + url).then(response => {
            if(response.status >= 200 && response.status < 300) {
                response.data.status = true;
                let list = response.data.data.list;
                let rows = [];
                list.map((item) => {
                    item.editIcon = <span className="glyphicon glyphicon-pencil"/>;
                    item.removeIcon = <span className="glyphicon glyphicon-trash"/>;
                    rows.push(item);
                });
                let items = [];
                if (response.data.data.count > this.perPage) {
                    let pageCount = Math.ceil(response.data.data.count / this.perPage);
                    let active = parseInt(this.page);
                    if (pageCount <= 20) {
                        for (let i = 1; i <= pageCount; i++) {
                            items.push(
                                <Pagination.Item key={i} active={i === active} onClick={() => this.parent.getRows(i)}>{i}</Pagination.Item>
                            );
                        }
                    } else {
                        if (active > 1) {
                            items.push(<Pagination.First key={1} onClick={() => this.parent.getRows(1)}/>);
                            items.push(<Pagination.Prev key={-1} onClick={() => this.parent.getRows(active - 1)}/>);
                        }
                        if (active > 3) items.push(<Pagination.Ellipsis key={-2}/>);
                        let start = active - 2;
                        if (start < 1) start = 1;
                        for (let i = start; i < active; i++) {
                            items.push(<Pagination.Item key={i} active={i === active} onClick={() => this.parent.getRows(i)}>{i}</Pagination.Item>);
                        }
                        items.push(<Pagination.Item key={active} active={true}>{active}</Pagination.Item>);
                        let finish = active + 2;
                        if (finish > pageCount) finish = pageCount;
                        for (let i = active + 1; i <= finish; i++) {
                            items.push(<Pagination.Item key={i} active={i === active} onClick={() => this.parent.getRows(i)}>{i}</Pagination.Item>);
                        }
                        if (active < pageCount - 2) items.push(<Pagination.Ellipsis key={-3}/>);
                        if (active < pageCount) {
                            items.push(<Pagination.Next key={-4} onClick={() => this.parent.getRows(active + 1)}/>);
                            items.push(<Pagination.Last key={-5} onClick={() => this.parent.getRows(pageCount)}/>);
                        }
                    }
                }
                let pagination = <Pagination bsSize="medium">{items}</Pagination>;
                callback(rows, pagination, response.data.data.count, response.data);
            }else{
                if(response.status === 401){
                    this.handleExpiredToken();
                }else {
                    console.error(response.data.note);
                    callback([], <Pagination bsSize="medium"/>, 0, response.data);
                }
            }
        }).catch(e => {
            if(e.message === "Request failed with status code 401"){
                this.handleExpiredToken();
            }
            if(e.response && e.response.data.note){
                callback([], '', 0, {status: false, note: e.response.data.note});
            }else{
                console.log(e.message);
                callback([], '', 0, {status: false, note: 'ارتباط با سرور برقرار نشد.'});
            }
        });
    }

    Post(callback){
        try {
            this.data.token = global.config.TOKEN;
            this.data.locale = this.locale;
            axios.post(this.server + '/' + this.url, this.data).then(response => {
                if(response.status >= 200 && response.status < 300) {
                    response.data.status = true;
                    callback(response.data);
                }else{
                    if(response.status === 401){
                        this.handleExpiredToken();
                    }else {
                        console.error(response.data.note);
                        callback(response.data);
                    }
                }
            }).catch(e => {
                if(e.response && e.response.data.note){
                    callback({status: false, note: e.response.data.note});
                }else{
                    console.log(e.message);
                    callback({status: false, note: 'ارتباط با سرور برقرار نشد.'});
                }
            });
        }catch (e) {
            if(e.message === "Request failed with status code 401"){
                this.handleExpiredToken();
            }
            console.error(e);
            callback({status: false, note: 'خطای سیستمی رخ داد'});
        }
    }

    Put(callback){
        try {
            this.data.token = global.config.TOKEN;
            this.data.locale = this.locale;
            axios({
                method: 'put',
                url: this.server + '/' + this.url,
                data: this.data
            }).then(response => {
                if(response.status >= 200 && response.status < 300) {
                    response.data.status = true;
                    callback(response.data);
                }else{
                    if(response.status === 401){
                        this.handleExpiredToken();
                    }else {
                        console.error(response.data.note);
                        callback(response.data);
                    }
                }
            }).catch(e => {
                if(e.response && e.response.data.note){
                    callback({status: false, note: e.response.data.note});
                }else{
                    console.log(e.message);
                    callback({status: false, note: 'ارتباط با سرور برقرار نشد.'});
                }
            });
        }catch (e){
            if(e.message === "Request failed with status code 401"){
                this.handleExpiredToken();
            }
            console.error(e);
            callback({status: false, note: 'خطای سیستمی رخ داد'});
        }
    }

    Delete(callback){
        try {
            let data = {
                token: global.config.TOKEN,
                id: this.data
            };
            if(this.type){
                data.type = this.type;
            }
            axios({
                method: 'delete',
                url: this.server + '/' + this.url,
                data: data
            }).then(response => {
                if(response.status >= 200 && response.status < 300) {
                    response.data.status = true;
                    callback(response.data);
                }else{
                    if(response.status === 401){
                        this.handleExpiredToken();
                    }else {
                        console.error(response.data.note);
                        callback(response.data);
                    }
                }
            }).catch(e => {
                if(e.response && e.response.data.note){
                    callback({status: false, note: e.response.data.note});
                }else{
                    console.log(e.message);
                    callback({status: false, note: 'ارتباط با سرور برقرار نشد.'});
                }
            });
        }catch (e){
            if(e.message === "Request failed with status code 401"){
                this.handleExpiredToken();
            }
            console.error(e);
            callback({status: false, note: 'خطای سیستمی رخ داد'});
        }
    }

    Upload(callback){
        try {
            axios({
                config: {
                    headers: {'Content-Type': 'multipart/form-data'}
                },
                method: 'post',
                url: this.server +  "/" + this.url,
                data: this.data,
            }).then(response => {
                if(response.status >= 200 && response.status < 300) {
                    response.data.status = true;
                    callback(response.data.data.item.link);
                }else{
                    if(response.status === 401){
                        this.handleExpiredToken();
                    }else {
                        console.error(response.data.note);
                    }
                }
            }).catch(e => {
                if(e.response && e.response.data.note){
                    callback({status: false, note: e.response.data.note});
                }else{
                    console.log(e.message);
                    callback({status: false, note: 'ارتباط با سرور برقرار نشد.'});
                }
            });
        }catch (e){
            if(e.message === "Request failed with status code 401"){
                this.handleExpiredToken();
            }
            console.error(e);
            callback({status: false, note: 'خطای سیستمی رخ داد'});
        }
    }
}
