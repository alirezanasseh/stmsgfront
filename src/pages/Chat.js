import React, {Component} from 'react';
import {Form, Button, Modal, ProgressBar, Spinner} from 'react-bootstrap';
import xhr from '../components/xhr';
import io from "socket.io-client";
import axios from 'axios';
import Func from '../components/Func';

const msgStatus = {
    waiting: <span className="glyphicon glyphicon-time message_status"/>,
    received: <span className="glyphicon glyphicon-ok message_status"/>
};
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
const loading = <img src={process.env.PUBLIC_URL + '/assets/img/loading.svg'}/>;

export default class Chat extends Component {
    state = {
        name: '',
        message: '',
        messages: [],
        progress: 0,
        show_attach: false,
        attach_file: null,
        chat_loaded: false,
        file_class: "outline-primary"
    };
    socket = io(global.config.BASE_URL, {
        query: {
            token: global.config.TOKEN
        }
    });

    componentDidMount() {
        this.socket.on('RECEIVE_MESSAGE', (data) => {
            let {messages} = this.state;
            data.status = msgStatus.received;
            messages[data.local_index] = data;
            this.setState({messages}, this.scrollToBottom);
        });
        new xhr(this, 'messages', 'conditions=' + JSON.stringify({chat_id: -1})).GetManyPure(response => {
            if(response.status){
                let messages = response.data.data.list;
                messages = messages.map(msg => {
                    msg.status = msgStatus.received;
                    return msg;
                });
                this.setState({messages, chat_loaded: true}, this.scrollToBottom);
            }
        });
    }

    scrollToBottom = () => {
        let chatElement = document.getElementById('chat');
        chatElement.scrollTop = chatElement.scrollHeight;
    };

    sendMessage = ev => {
        ev.preventDefault();
        let {message, attach_file, messages} = this.state;
        if(!message && !attach_file) return;

        let local_index = messages.length;
        let msg = {
            chat_id: -1,
            sender_name: localStorage.getItem('smuser'),
            message,
            status: msgStatus.waiting,
            local_index
        };

        let sendMsg = {
            token: global.config.TOKEN,
            message,
            local_index
        };
        if(attach_file){
            msg.file_name = attach_file.name;
            messages.push(msg);
            this.setState({messages, message: ''}, this.scrollToBottom);
            const data = new FormData();
            data.append('file', attach_file);
            data.append('token', global.config.TOKEN);
            axios.post(global.config.BASE_URL + '/upload', data, {
                onUploadProgress: ProgressEvent => {
                    this.setState({
                        progress: (ProgressEvent.loaded / ProgressEvent.total * 100)
                    });
                }
            }).then(res => {
                if(res.status >= 200 && res.status < 300){
                    sendMsg.file_id = res.data.data.item.id;
                    sendMsg.file_name = res.data.data.item.file_name;
                    this.socket.emit('SEND_MESSAGE', sendMsg);
                    this.setState({attach_file: null, file_class: "outline-primary"});
               }else{
                    // file not uploaded
                }
            });
        }else{
            messages.push(msg);
            this.setState({messages, message: ''}, this.scrollToBottom);
            this.socket.emit('SEND_MESSAGE', sendMsg);
        }
    };

    hideAttach = () => {
        this.setState({show_attach: false});
    };

    changeFile = event => {
        this.setState({
            attach_file: event.target.files[0],
            show_attach: false,
            file_class: "primary"
        });
    };

    keyPressed = event => {
        if(event.key === "Enter" && !event.shiftKey){
            this.sendMessage(event);
        }
    };

    render(){
        let {messages, message, show_attach, attach_file, progress, file_class, chat_loaded} = this.state;
        let {width, height} = this.props;
        let messageFieldWidth = width - 135;
        messageFieldWidth += "px";
        let chatHeight = height - 83;
        chatHeight += "px";
        let messageContent = '';
        let ext = '';

        return (
            <div>
                <Modal show={show_attach} onHide={this.hideAttach} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>فایل</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <input type="file" name="file" onChange={this.changeFile}/>
                        {attach_file && <div style={{marginTop: "10px"}}>فایل انتخابی : {attach_file.name}</div>}
                    </Modal.Body>
                </Modal>
                <div id="chat" style={{height: chatHeight, overflow: "auto", position: "relative"}}>
                    <div style={{position: "absolute", bottom: "0px", width: "100%", maxHeight: chatHeight}}>
                        {!chat_loaded && loading}
                        {
                            messages &&
                            messages.map(msg => {
                                messageContent = msg.sender_name + " : ";
                                if(msg.message){
                                    messageContent = <span>
                                        {messageContent}
                                        {Func.nl2br(msg.message)}
                                    </span>;
                                    if(msg.file_name){
                                        messageContent = <span>{messageContent} </span>;
                                    }
                                }
                                if(msg.file_name){
                                    if(msg.file_id){
                                        ext = msg.file_name.split('.');
                                        ext = ext[ext.length - 1];
                                        if(imageExtensions.indexOf(ext) > -1){
                                            messageContent = <span>
                                                <div className="message_text">{messageContent}</div>
                                                <div className="message_image">
                                                    <a href={global.config.BASE_URL + '/download/' + msg.file_id}>
                                                        <img src={global.config.BASE_URL + '/download/' + msg.file_id}/>
                                                    </a>
                                                </div>
                                            </span>;
                                        }else{
                                            messageContent = <span>
                                                <div className="message_text">{messageContent}</div>
                                                <a href={global.config.BASE_URL + '/download/' + msg.file_id}>
                                                    <span>
                                                        <span className="glyphicon glyphicon-file message-file"/>
                                                        {msg.file_name}
                                                    </span>
                                                </a>
                                            </span>
                                        }
                                    }else{
                                        messageContent += msg.file_name;
                                    }
                                }

                                return (
                                    <div className="chat_box">
                                        {messageContent}
                                        <div style={{float: "left"}}>{msg.status}</div>
                                        <div style={{clear: "both"}}/>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
                <div style={{position: "absolute", bottom: "0", padding: "10px 0", height: "90px"}}>
                    {progress > 0 && progress < 100 && <ProgressBar animated={true} now={progress}/>}
                    <Form onSubmit={this.sendMessage}>
                        <div style={{width: messageFieldWidth, float: "right", padding: "2px"}}>
                            <Form.Control 
                                as="textarea"
                                name="message" 
                                value={message} 
                                onChange={e => this.setState({message: e.target.value})}
                                onKeyDown={this.keyPressed}
                                placeholder="پیام خود را بنویسید"
                                autoFocus={true}
                            />
                        </div>
                        <div style={{width: "44px", float: "right", padding: "2px"}}>
                            <Button variant={file_class} onClick={() => this.setState({show_attach: true})}><span className="glyphicon glyphicon-file"/></Button>
                        </div>
                        <div style={{width: "61px", float: "right", padding: "2px"}}>
                            <Button variant="primary" type="submit">ارسال</Button>
                        </div>
                    </Form>
                </div>
            </div>
        );
    }
}