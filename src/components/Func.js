import React from 'react';

export default new class Func {
    cutString = (str, len) => {
        if(!str || !len) return;
        let sub = str.substring(0, len);
        for(let i = len; str.substring(i, 1) !== ' '; i++){
            sub += str.substring(i, 1);
        }
        return sub;
    };

    currencyFormat = (no) => {
        if(!no) return;
        let negative = false;
        if(no < 0){
            negative = true;
            no *= -1;
        }
        no = no.toString();
        let formatted = "";
        for(let i = no.length - 1, j = 1; i >= 0; i--, j++){
            formatted = no[i] + formatted;
            if(j % 3 === 0 && i > 0) formatted = "," + formatted;
        }
        if(negative){
            formatted = "-" + formatted;
        }
        return formatted;
    };

    nl2br = text => {
        return text.split('\n').map((item, key) => {
            return <span key={key}>{item}<br/></span>
        })
    }
}