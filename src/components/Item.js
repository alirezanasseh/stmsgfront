import React, { Component } from 'react';
import {Button, Alert, Form} from "react-bootstrap";
import xhr from "../components/xhr";
import {Redirect} from 'react-router-dom';
import moment from 'moment-jalaali';
import PickUser from "../components/PickUser";
import DatePicker from 'react-datepicker2';
import ReactTags from 'react-tag-autocomplete';
import SelectSearch from 'react-select-search';
import Image from "./Image";

const loadingGif = <span className="glyphicon glyphicon-repeat fast-right-spinner"/>;

export default class Item extends Component {
    module = this.props.base.module;
    server = this.props.base.server;
    state = {
        item: {},
        message: null,
        submitLoading: false,
        redirect: false,
        uploading: {},
        select_search_items: {},
        form_inputs: [],
        dimensions: {
            width: 800,
            height: 800
        },
        options: {},
        user_name: '',
        date_item: {},
        tags: {},
    };
    imageRef = React.createRef();

    constructor(props){
        super(props);
        if(props.data.id){
            this.title = "ویرایش " + this.props.base.entity;
            this.id = props.data.id;
        }else{
            this.title = "افزودن " + this.props.base.entity + " جدید";
            this.id = null;
        }
    }

    componentDidMount(){
        if(this.id) {
            new xhr(this, this.props.base.module, this.id).GetOne((response_item) => {
                let fields = this.props.data.fields;
                let {date_item} = this.state;
                let item = {};
                for(let i = 0; i < fields.length; i++){
                    if(response_item[fields[i].name]){
                        if(this.props.base.model[fields[i].name].type === "date"){
                            let d = response_item[fields[i].name].split(' ');
                            response_item[fields[i].name] = d[0].replace(/-/g, "/");
                            date_item[fields[i].name] = response_item[fields[i].name] ? moment(response_item[fields[i].name], "YYYY/MM/DD") : "";
                        }
                        item[fields[i].name] = response_item[fields[i].name];
                    }
                }
                let beforeLoad = this.props.data.beforeLoad;
                if(beforeLoad){
                    item = beforeLoad(item);
                }
                this.setState({item, date_item}, () => {
                    for(let i = 0; i < fields.length; i++){
                        if(fields[i].change){
                            fields[i].change(item[fields[i].name]);
                        }
                    }
                });
            });
        }else{
            if(this.props.data.fields){
                let fields = this.props.data.fields;
                let item = {};
                for(let i = 0; i < fields.length; i++){
                    if(!fields[i].name) continue;
                    if(this.props.base.model[fields[i].name].type === "foreign_array") {
                        item[fields[i].name] = [];
                    }else if(this.props.base.model[fields[i].name].type === "number"){
                        item[fields[i].name] = 0;
                    }else{
                        item[fields[i].name] = '';
                    }
                }
                this.setState({item});
            }
        }
        let model = this.props.base.model;

        for(let field in model){
            let field_is_select_data = this.props.data.fields.filter(f => f.name === field && f.type === "select_data").length > 0;
            let field_is_select_search_data = this.props.data.fields.filter(f => f.name === field && f.type === "select_search_data").length > 0;
            let field_is_tag_data = this.props.data.fields.filter(f => f.name === field && f.type === "tag_data").length > 0;
            if(model[field].foreign && (field_is_select_data || field_is_tag_data || field_is_select_search_data)){
                new xhr(this, model[field].foreign.module, '', -1).GetManyPure(response => {
                    if(response.status){
                        let list = response.data.data.list;
                        let item = {};
                        let option = "";
                        let result = model[field].foreign.result;
                        let options = this.state.options;
                        for(let i = 0; i < list.length; i++){
                            item = list[i];
                            option = "";
                            for(let r = 0; r < result.length; r++){
                                if(result[r].name) option += item[result[r].name];
                                if(result[r].type === "static") option += result[r].value;
                                if(result[r].type === "function"){
                                    let fgFields = [];
                                    for(let rf = 0; rf < result[r].value.params.length; rf++){
                                        fgFields.push(item[result[r].value.params[rf]]);
                                    }
                                    option += result[r].value.func(fgFields);
                                }
                            }
                            if(options[field]){
                                if(field_is_select_data){
                                    options[field].push(<option value={item.id}>{option}</option>);
                                }
                                if(field_is_tag_data){
                                    options[field].push({id: item.id, name: option});
                                }
                                if(field_is_select_search_data){
                                    options[field].push({name: option, value: item.id});
                                }
                            }else {
                                if(field_is_select_data){
                                    options[field] = [<option value={item.id}>{option}</option>];
                                }
                                if(field_is_tag_data){
                                    options[field] = [{id: item.id, name: option}];
                                }
                                if(field_is_select_search_data){
                                    options[field] = [{name: option, value: item.id}];
                                }
                            }
                        }
                        this.setState({options});
                    }
                });
            }
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();
        let data = this.state.item;
        let beforeSubmit = this.props.data.beforeSubmit;
        if(beforeSubmit){
            data = beforeSubmit(data);
            if(!data) return false;
        }
        this.setState({
            submitLoading: true
        });
        if(this.id){
            data.id = this.id;
            new xhr(this, this.props.base.module, data).Put(response => this.showResult(response));
        }else{
            new xhr(this, this.props.base.module, data).Post(response => this.showResult(response));
        }
    };

    showResult = (response) => {
        if(response.status){
            this.setState({
                message: <Alert variant="success">با موفقیت ثبت شد</Alert>,
                submitLoading: false,
            });
        }else{
            this.setState({
                message: <Alert variant="danger">{response.note}</Alert>,
                submitLoading: false,
            });
        }
        window.scrollTo(0, 0);
        let afterSubmit = this.props.data.afterSubmit;
        if(afterSubmit){
            afterSubmit(this);
        }
    };

    handleChange = (event) => {
        let target = event.target;
        let item = this.state.item;
        if(target.multiple){
            item[target.name] = [];
            for(let i = 0; i < target.options.length; i++){
                if(target.options[i].selected){
                    item[target.name].push(target.options[i].value);
                }
            }
        }else{
            item[target.name] = target.value;
        }
        if(this.props.base.model[target.name].related_field_name){
            item[this.props.base.model[target.name].related_field_name] = target[target.selectedIndex].text;
        }
        this.setState({item});
        let change = this.props.data.fields.filter(field => field.name === target.name);
        if(change && change[0] && change[0].change){
            change[0].change(target.value);
        }
    };

    handleUpload = data => {
        data.append('type', this.props.base.module);
        data.append('token', global.config.TOKEN);
        let uploading = this.state.uploading;
        uploading[this.imageType] = true;
        this.setState({uploading});
        new xhr(this, 'upload', data).Upload(link => {
            let uploading = this.state.uploading;
            uploading[this.imageType] = false;
            this.setState({uploading});
            if(link){
                let item = this.state.item;
                item[this.imageType] = link;
                this.setState({item});
            }
        });
    };

    handleRemoveImage = (field_name) => {
        let item = this.state.item;
        item[field_name] = '';
        this.setState({item});
    };

    handleSelect = (e, type) => {
        this.imageType = type;
        let model = this.props.base.model;
        let dimensions = this.state.dimensions;
        dimensions.width = model[type].width;
        dimensions.height = model[type].height;
        this.setState({dimensions});
        // this.imageSelectRef.current.onSelectFile(e);
        this.imageRef.current.onSelectFile(e);
    };

    handleChangeUser = (id, full_name, idField, nameField) => {
        if(id){
            let item = this.state.item;
            item[idField] = id;
            if(nameField) item[nameField] = full_name;
            this.setState({item});
        }
    };

    changeDate = (value, field) => {
        if(!value) return;
        let item = this.state.item;
        item[field] = value.format('YYYY/MM/DD');
        this.setState({item});
    };

    handleAddition = (tag, field) => {
        let {tags, item} = this.state;
        if(tags[field]){
            tags[field].push(tag);
        }else{
            tags[field] = [tag];
        }
        if(item[field]){
            item[field].push(tag.id);
        }else{
            item[field] = [tag.id];
        }
        this.setState({tags, item});
    };

    handleDelete = (i, field) => {
        let tags = this.state.tags;
        tags[field].splice(i, 1);
        this.setState({tags});
    };

    handleChangeSelectSearch = (args) => {
        if(args.e){
            let item = this.state.item;
            item[args.name] = args.e.value;
            this.setState({item});
        }
    };

    render(){
        let {message, submitLoading, redirect, item, dimensions, options, date_item, tags} = this.state;
        let {fields} = this.props.data;
        let {path} = this.props.base;

        if(redirect){
            return <Redirect to={path} />;
        }

        return (
            <div>
                {dimensions.width && dimensions.height && <Image ref={this.imageRef} upload={this.handleUpload} width={dimensions.width} height={dimensions.height}/>}
                <h2>{this.title}</h2>
                <form onSubmit={this.handleSubmit}>
                    {message}
                    {fields && item && fields.map(field => {
                        let model = this.props.base.model[field.name];
                        if(!model) model = field;
                        let type = model.type;
                        if(field.type) type = field.type;
                        if(!item[field.name] && field.default){
                            item[field.name] = field.default;
                        }
                        let input = '';
                        let tag_suggestions = [];
                        switch (type) {
                            case "image":
                                input = <span>
                                    <Form.Control
                                        name={field.name}
                                        type="file"
                                        onChange={(e) => this.handleSelect(e, field.name)}
                                        style={field.style}
                                    />
                                    <div style={{marginTop: "10px"}}>{this.state.uploading[field.name] ? loadingGif : ""}</div>
                                </span>;
                                if(item[field.name]) {
                                    input = <span>
                                        {input}
                                        <div>
                                            <img src={item[field.name]} className="icon" alt={field.name} />
                                            <Button variant="danger" title="حذف" onClick={() => this.handleRemoveImage(field.name)}>×</Button>
                                        </div>
                                    </span>;
                                }
                                break;
                            case "textarea":
                                input = <Form.Control
                                    as="textarea"
                                    name={field.name}
                                    value={item[field.name]}
                                    onChange={this.handleChange}
                                    rows={field.rows ? field.rows : 10}
                                    style={field.style}
                                />;
                                break;
                            case "select":
                                input = <Form.Control
                                    as="select"
                                    name={field.name}
                                    value={item[field.name]}
                                    onChange={this.handleChange}
                                    style={field.style}
                                    multiple={field.multiple}
                                    size={field.size}
                                >
                                    {!field.multiple && <option value=''>{model.title} را انتخاب کنید</option>}
                                    {model.items.map(item => <option key={item.key} value={item.key}>{item.value}</option>)}
                                </Form.Control>;
                                break;
                            case "select_items":
                                input = <Form.Control
                                    as="select"
                                    name={field.name}
                                    value={item[field.name]}
                                    onChange={this.handleChange}
                                    style={field.style}
                                    multiple={field.multiple}
                                    size={field.size}
                                >
                                    {!field.multiple && <option value=''>{model.title} را انتخاب کنید</option>}
                                    {field.items.map(item => <option key={item.key} value={item.key}>{item.value}</option>)}
                                </Form.Control>;
                                break;
                            case "select_data":
                                input = <Form.Control
                                    as="select"
                                    name={field.name}
                                    value={item[field.name]}
                                    onChange={this.handleChange}
                                    style={field.style}
                                    multiple={field.multiple}
                                    size={field.size}
                                >
									{!field.multiple && <option value=''>{model.title} را انتخاب کنید</option>}
                                    {options[field.name] && options[field.name].map(option => option)}
                                </Form.Control>;
                                break;
                            case "select_search_data":
                                input = <SelectSearch
                                    options={options[field.name]}
                                    name={field.name}
                                    value={item[field.name]}
                                    onChange={e => this.handleChangeSelectSearch({e, name: field.name, value: item[field.name]})}
                                />;
                                break;
                            case "date":
                                input = <DatePicker
                                    onChange={value => this.changeDate(value, field.name)}
                                    value={date_item[field.name]}
                                    isGregorian={false}
                                    timePicker={false}
                                />;
                                break;
                            case "user_picker":
                                input = <PickUser
                                    changeUser={this.handleChangeUser}
                                    user={{id: item[field.name], full_name: item[field.label]}}
                                    idField={field.name}
                                    nameField={model.related_field_name}
                                    path={path}
                                />;
                                break;
                            case "function_button":
                                let params = {};
                                if(field.value && field.value.params){
                                    for(let p = 0; p < field.value.params.length; p++){
                                        params[field.value.params[p]] = item[[field.value.params[p]]];
                                    }
                                }
                                input = <Button
                                    variant="info"
                                    onClick={() => field.value.func(params)}
                                >
                                    {field.caption}
                                </Button>;
                                break;
                            case "hidden":
                                input = <Form.Control type="hidden" name={field.name} value={item[field.name]}/>;
                                break;
                            case "tag_items":
                                tag_suggestions = field.items.map(item => {return {id: item.key, name: item.value}});
                                input = <ReactTags
                                    tags={tags[field.name]}
                                    suggestions={tag_suggestions}
                                    handleAddition={tag => this.handleAddition(tag, field.name)}
                                    handleDelete={i => this.handleDelete(i, field.name)}
                                    placeholder={model.title}
                                    autofocus={false}
                                />;
                                break;
                            case "tag_data":
                                tag_suggestions = options[field.name];
                                input = <ReactTags
                                    tags={tags[field.name]}
                                    suggestions={tag_suggestions}
                                    handleAddition={tag => this.handleAddition(tag, field.name)}
                                    handleDelete={i => this.handleDelete(i, field.name)}
                                    placeholder={model.title}
                                    autofocus={false}
                                />;
                                break;
                            default:
                                input = <Form.Control
                                    type="text"
                                    name={field.name}
                                    value={item[field.name]}
                                    onChange={this.handleChange}
                                    style={field.style}
                                />;
                                break;
                        }
                        return(
                            field.type !== "hidden" ?
                                <Form.Group>
                                    <Form.Label>{model.title}</Form.Label>
                                    {input}
                                </Form.Group>
                                :
                                input
                        );
                    })}
                    <Button type="submit" disabled={submitLoading} variant="primary">
                        {submitLoading ? <span className="glyphicon glyphicon-repeat fast-right-spinner"/> : 'ثبت'}
                    </Button>
                </form>
                <p>&nbsp;</p>
            </div>
        );
    }
}