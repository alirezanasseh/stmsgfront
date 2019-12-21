import React, { Component } from 'react';
import {Button, Alert, Accordion, Card, Form, Row, Col} from "react-bootstrap";
import xhr from "./xhr";
import 'react-image-lightbox/style.css';
import LightBox from "react-image-lightbox";
import moment from "moment-jalaali";
import PickUser from "./PickUser";
import {Link} from 'react-router-dom';

const loadingGif = <span className="glyphicon glyphicon-repeat fast-right-spinner"/>;
let key = {
    tr: 1,
    td: 1
};

export default class List extends Component {
    module = this.props.base.module;
    server = this.props.base.server;
    page = this.props.data.page ? this.props.data.page : 1;
    perPage = this.props.data.perPage ? this.props.data.perPage : 25;
    state = {
        rows: null,
        page: this.page,
        pagination: null,
        show_image: false,
        show_images: false,
        photo_index: 0,
        remove_loading: [],
        message: '',
        foreignFields: {},
        confirm_loading: [],
        search: {},
        search_items: {},
        search_loading: false,
        perPage: this.perPage,
        show_confirmed: 1,
        count: 0,
        order: this.props.data.order ? this.props.data.order : "_id",
        order_asc: this.props.data.order_asc ? this.props.data.order_asc : -1,
    };

    componentDidMount(){
        this.getRows();
    }

    checkForIterate = (fields) => {
        for(let i = 0; i < fields.length; i++){
            let model = this.props.base.model[fields[i].name];
            if(!model) model = fields[i];
            if(model.type === "date" || model.type === "time" || model.type === "foreign" || model.type === "foreign_array" || model.type === "select_search" || model.type === "conditional_foreign"){
                return true;
            }
            if(fields[i].type === "multiple"){
                if(this.checkForIterate(fields[i].result)) return true;
            }
        }
        return false;
    };

    changeFields = (row, fields) => {
        for(let f = 0; f < fields.length; f++){
            let model = this.props.base.model[fields[f].name];
            if(!model) model = fields[f];
            if(model.type === "date"){
                row[fields[f].alias] = row[fields[f].name] ? moment(row[fields[f].name], "YYYY/MM/DD HH:mm:ss").format("jYYYY/jMM/jDD") : '';
            }
            if(model.type === "time"){
                row[fields[f].alias] = row[fields[f].name] ? moment(row[fields[f].name], "YYYY/MM/DD HH:mm:ss").format("HH:mm:ss") : '';
            }
            if(model.type === "foreign"){
                if(row[fields[f].name]){
                    if(this.foreignIds.length > 0){
                        if(this.foreignIds.filter(foreign => foreign.module === model.foreign.module).length > 0){
                            if(this.foreignIds.filter(foreign => foreign.module === model.foreign.module).filter(foreign => foreign.ids.indexOf(row[fields[f].name]) > -1).length === 0){
                                this.foreignIds = this.foreignIds.map(foreign => {
                                    if(foreign.module === model.foreign.module){
                                        foreign.ids.push(row[fields[f].name]);
                                    }
                                    return foreign;
                                });
                            }
                        }else{
                            this.foreignIds.push({
                                module: model.foreign.module,
                                ids: [row[fields[f].name]],
                                result: model.foreign.result,
                                relation_field: model.foreign.field
                            });
                        }
                    }else{
                        this.foreignIds.push({
                            module: model.foreign.module,
                            ids: [row[fields[f].name]],
                            result: model.foreign.result,
                            relation_field: model.foreign.field
                        });
                    }
                }
            }
            if(model.type === "foreign_array"){
                if(row[fields[f].name]) {
                    if (this.foreignIds.length > 0) {
                        if(this.foreignIds.filter(foreign => foreign.module === model.foreign.module).length > 0){
                            this.foreignIds = this.foreignIds.map(foreign => {
                                if(foreign.module === model.foreign.module){
                                    foreign.ids = foreign.ids.concat(row[fields[f].name]);
                                    foreign.ids = foreign.ids.filter((item, index) => {return foreign.ids.indexOf(item) === index}); // remove repeated ids
                                }
                                return foreign;
                            });
                        }else{
                            this.foreignIds.push({
                                module: model.foreign.module,
                                ids: row[fields[f].name],
                                result: model.foreign.result,
                                relation_field: model.foreign.field
                            });
                        }
                    }else{
                        this.foreignIds.push({
                            module: model.foreign.module,
                            ids: row[fields[f].name],
                            result: model.foreign.result,
                            relation_field: model.foreign.field
                        });
                    }
                }
            }
            if(model.type === "conditional_foreign"){
                // TODO: update this
                if(row[fields[f].name]){
                    let ffound = false;
                    for(let ff = 0; ff < this.foreignIds.length; ff++){
                        if(this.foreignIds[ff].field === fields[f].name && this.foreignIds[ff].module === model.foreign.value[row[model.foreign.field]].module){
                            if(this.foreignIds[ff].ids.indexOf(row[fields[f].name]) === -1) {
                                this.foreignIds[ff].ids.push(row[fields[f].name]);
                            }
                            ffound = true;
                            break;
                        }
                    }
                    if(!ffound){
                        this.foreignIds.push({
                            field: fields[f].name,
                            module: model.foreign.value[row[model.foreign.field]].module,
                            ids: [row[fields[f].name]],
                            result: model.foreign.value[row[model.foreign.field]].result,
                            relation_field: model.foreign.value[row[model.foreign.field]].field
                        });
                    }
                }
            }
            if(fields[f].type === "multiple"){
                this.changeFields(row, fields[f].result);
            }
        }
    };

    getForeignFields = (index) => {
        if(index >= this.foreignIds.length) return;
        let foreignConditions = "";
        let foreignGetFields = "";
        let value = "";
        let result = "";
        for(let j = 0; j < this.foreignIds[index].ids.length; j++){
            if(this.foreignIds[index].result){
                let fgFields = [];
                if(this.foreignIds[index].relation_field !== "id"){
                    fgFields.push(this.foreignIds[index].relation_field);
                }
                for(let r = 0; r < this.foreignIds[index].result.length; r++){
                    if(this.foreignIds[index].result[r].name){
                        fgFields.push(this.foreignIds[index].result[r].name);
                    }
                    if(this.foreignIds[index].result[r].type === "function"){
                        for(let rf = 0; rf < this.foreignIds[index].result[r].value.params.length; rf++){
                            fgFields.push(this.foreignIds[index].result[r].value.params[rf]);
                        }
                    }
                }
                foreignGetFields = "fields=" + JSON.stringify(fgFields);
            }else{
                foreignGetFields = "";
            }
        }
        if(this.foreignIds[index].relation_field === "id"){
            foreignConditions = JSON.stringify({id_list: this.foreignIds[index].ids});
        }else{
            foreignConditions = JSON.stringify({[this.foreignIds[index].relation_field]: {'$in': this.foreignIds[index].ids}});
        }
        let module = this.foreignIds[index].module;
        new xhr(this, module, foreignGetFields + "&conditions=" + foreignConditions).GetManyPure(response => {
            if(response.status){
                response = response.data.data.list;
                let foreignFields = {};
                foreignFields[module] = {};
                for(let r = 0; r < response.length; r++){
                    value = "";
                    result = this.foreignIds[index].result;
                    for(let v = 0; v < result.length; v++){
                        if(result[v].name){
                            if(response[r][result[v].name]) {
                                value += response[r][result[v].name];
                            }
                        }
                        if(result[v].type === "static"){
                            value += result[v].value;
                        }
                        if(result[v].type === "function"){
                            let params = [];
                            for(let p = 0; p < result[v].value.params.length; p++){
                                params.push(response[r][result[v].value.params[p]]);
                            }
                            value += result[v].value.func(params);
                        }
                    }

                    foreignFields[module][response[r][this.foreignIds[index].relation_field]] = value;
                }
                let stateFF = this.state.foreignFields;
                stateFF[module] = foreignFields[module];
                this.setState({foreignFields: stateFF}, () => {
                    let modules = [];
                    for(let key of Object.keys(this.state.foreignFields)){
                        modules.push(key);
                    }
                    this.getForeignFields(index + 1);
                });
            }
        });
    };

    getRows = (pageNumber = this.page, order = this.state.order, order_asc = this.state.order_asc, callback) => {
        this.setState({order_asc, order});
        let cond = this.checkSearch(this.props.data.default_conditions);
        let condition = "";
        if(cond && Object.keys(cond).length !== 0){
            condition = "conditions=" + JSON.stringify(cond) + "&";
        }
        let get_fields = this.props.data.get_fields;
        if(get_fields){
            get_fields = "fields=" + JSON.stringify(get_fields) + "&";
        }else{
            get_fields = "";
        }
        let request_query_string = this.props.data.request_query_string;
        if(request_query_string){
            request_query_string += "&";
        }else{
            request_query_string = "";
        }
        let order_part = {};
        order_part[order] = order_asc;
        new xhr(this, this.module, request_query_string + get_fields + condition + 'sort=' + JSON.stringify(order_part), pageNumber, '', this.state.perPage, this.server).GetMany((rows, pagination, count, response) => {
            if(response && response.status) {
                if(this.props.data.page_query_string){
                    this.props.data.page_query_string = "?" + this.props.data.page_query_string;
                }else{
                    this.props.data.page_query_string = "";
                }
                window.history.replaceState(null, null, this.props.base.path + "/" + pageNumber + this.props.data.page_query_string);
                window.scrollTo(0, 0);

                if(rows.length === 0){
                    this.setState({rows: []}, callback);
                }

                let fields = this.props.data.fields;
                this.foreignIds = [];
                if(this.checkForIterate(fields)){
                    for(let r = 0; r < rows.length; r++){
                        this.changeFields(rows[r], fields);
                    }
                }
                this.setState({rows, pagination, count}, callback);
                if(this.foreignIds.length > 0) {
                    this.getForeignFields(0);
                }
            }else{
                this.setState({message: <Alert variant="danger">{response.note}</Alert>, rows: []}, callback);
            }
        });
    };

    remove = (id, e) => {
        e.preventDefault();
        let ans = window.confirm('آیا مطمئنید که می خواهید این مورد را حذف کنید؟');
        if(!ans) return;
        let remove_loading = this.state.remove_loading;
        remove_loading[id] = true;
        this.setState({remove_loading});
        new xhr(this, this.module, id).Delete((response) => {
            if(response.status) {
                this.setState({message: <Alert variant="success">{response.note}</Alert>, rows: this.state.rows.filter(item => item.id !== id)});
            }else{
                this.setState({message: <Alert variant="danger">{response.note}</Alert>});
            }
            this.setState({remove_loading: this.state.remove_loading.filter((key, value) => key !== id)});
        });
    };

    showImage = (image) => {
        this.image = image;
        this.setState({show_image: true});
    };

    showImages = (images) => {
        this.images = images;
        this.setState({photo_index: 0, show_images: true});
    };

    confirm = (args) => {
        let confirm_loading = this.state.confirm_loading;
        confirm_loading[args.id] = true;
        this.setState({confirm_loading});
        let data = {id: args.id};
        let confirmField = this.props.base.confirm_field;
        data[confirmField] = args.confirmed;
        let confirmExtraFields = this.props.base.confirm_extra_fields;
        if(confirmExtraFields){
            for(let i = 0; i < confirmExtraFields.length; i++){
                data[confirmExtraFields[i]] = args.confirmed;
            }
        }
        let confirmedExtraFields = this.props.base.confirmed_extra_fields;
        if(confirmedExtraFields && args.confirmed){
            for(let i = 0; i < confirmedExtraFields.length; i++){
                data[confirmedExtraFields[i]] = args.confirmed;
            }
        }
        let confirmOtherFields = this.props.base.confirm_other_fields;
        if(confirmOtherFields){
            let otherField = '';
            for(let i = 0; i < confirmOtherFields.length; i++){
                otherField = confirmOtherFields[i];
                if (otherField.name) {
                    data[otherField.alias] = args[otherField.alias];
                } else {
                    data[otherField] = args[otherField];
                }
            }
        }
        new xhr(this, this.props.base.module, data).Put((response) => {
            if(response.status){
                this.getRows(this.state.page, this.state.order, this.state.order_asc, () => {
                    this.setState({message: "", confirm_loading: this.state.confirm_loading.filter((key, value) => key !== args.id)});
                });
            }else{
                this.setState({message: <Alert variant="danger">{response.note}</Alert>, confirm_loading: this.state.confirm_loading.filter((key, value) => key !== args.id)});
            }
        });
    };

    checkSearch = (default_conditions) => {
        let search = this.state.search;
        let cond = default_conditions || {};
        let search_data = this.props.data.search;
        if (search_data) {
            let value = '';
            for (let i = 0; i < search_data.length; i++) {
                value = '';
                if (search[search_data[i].name] || (search[search_data[i].name + "_from"] && search[search_data[i].name + "_to"])) {
                    if (search_data[i].search_type === "exact") {
                        value = search[search_data[i].name];
                    }
                    if (search_data[i].search_type === "regex") {
                        if (search_data[i].regex_type === "middle") {
                            value = {$regex: ".*" + search[search_data[i].name] + ".*"};
                        }
                        if (search_data[i].regex_type === "start") {
                            value = {$regex: search[search_data[i].name] + ".*"};
                        }
                    }
                    if (search_data[i].search_type === "gte") {
                        value = {$gte: parseInt(search[search_data[i].name])};
                    }
                    if (search_data[i].search_type === "lte") {
                        value = {$lte: parseInt(search[search_data[i].name])};
                    }
                    if (search_data[i].component_type === "between") {
                        value = {
                            $gte: parseInt(search[search_data[i].name + "_from"]),
                            $lte: parseInt(search[search_data[i].name + "_to"])
                        };
                    }
                }
                if (value) {
                    cond[search_data[i].field] = value;
                }
                if (search_data[i].fields) {
                    let condArray = [];
                    for (let j = 0; j < search_data[i].fields.length; j++) {
                        let search_field = search_data[i].fields[j];
                        value = '';
                        if (search[search_data[i].name]) {
                            if (search_field.search_type === "exact") {
                                value = search[search_data[i].name];
                            }
                            if (search_field.search_type === "regex") {
                                if (search_field.regex_type === "middle") {
                                    value = {$regex: ".*" + search[search_data[i].name] + ".*"};
                                }
                                if (search_field.regex_type === "start") {
                                    value = {$regex: search[search_data[i].name] + ".*"};
                                }
                            }
                        }
                        if (value) {
                            if(search_data[i].field_type === "number"){
                                value = parseInt(value);
                            }
                            condArray.push({[search_field.field]: value});
                        }
                    }
                    if (condArray.length > 0) {
                        cond["$or"] = condArray;
                    }
                }
            }
        }
        switch (parseInt(this.state.show_confirmed)) {
            case 2:
                cond[this.props.base.confirm_field] = true;
                break;
            case 3:
                cond[this.props.base.confirm_field] = false;
                break;
        }
        return cond;
    };

    handleChangeSearch = (e) => {
        let target = e.target;
        let search = this.state.search;
        let search_items = this.state.search_items;
        if(target.type === "checkbox"){
            search[target.name] = target.checked;
            search_items[target.name] = [target.name, target.name];
        }else{
            search[target.name] = target.value;
            search_items[target.name] = [target.name, target.value];
        }

        if(target.value === ''){
            delete search_items[target.name];
        }

        this.setState({search, search_items});
    };

    handleChangeUser = (id, name, id_field, name_field) => {
        if(id){
            let search = this.state.search;
            search[id_field] = id;

            let search_items = this.state.search_items;
            search_items[id_field] = [id, name];

            this.setState({search, search_items});
        }
    };

    removeSearchItem = (key) => {
        let search = this.state.search;
        let search_items = this.state.search_items;
        search[key] = '';
        delete search_items[key];
        this.setState({rows: null, count: loadingGif, search, search_items}, this.getRows);
    };

    handleSearch = (e) => {
        e.preventDefault();
        this.setState({search_loading: true});
        this.getRows(1, this.state.order, this.state.order_asc, () => this.setState({search_loading: false}));
    };

    handleChangePerPage = (e) => {
        let target = e.target;
        this.setState({rows: null, perPage: target.value}, this.getRows);
    };

    showConfirmed = (e) => {
        let target = e.target;
        this.setState({row: null, count: loadingGif, show_confirmed: target.value}, this.getRows);
    };

    showNestedField = (row, field) => {
        let nested_fields = field.name.split(".");
        let value = row[nested_fields[0]];
        if(value) {
            for (let i = 1; i < nested_fields.length; i++) {
                if (nested_fields[i]) {
                    value = value[nested_fields[i]];
                }
            }
        }
        return value;
    };

    processField(row, field){
        if(!field) return;
        let {foreignFields} = this.state;
        let model = this.props.base.model[field.name];
        if(!model) model = field;
        let type = model.type;
        if(field.type) type = field.type;
        let result = '';
        switch(type){
            case "nested":
                result = this.showNestedField(row, field);
                break;
            case "image":
                if(row[field.name]) {
                    result = <img
                        src={row[field.name]}
                        className="small-icon"
                        onClick={() => this.showImage(row[field.name])}
                        alt={row[field.name]}
                    />;
                }
                break;
            case "images":
                if(row[field.name] && row[field.name][0]) {
                    result = <img
                        src={row[field.name][0]}
                        className={row[field.name].length > 1 ? "small-icon multiple-images" : "small-icon"}
                        onClick={() => this.showImages(row[field.name])}
                    />;
                }
                break;
            case "foreign_array":
                if (foreignFields && foreignFields[model.foreign.module]) {
                    let res = "";
                    if(row[field.name]) {
                        for (let i = 0; i < row[field.name].length; i++) {
                            res = foreignFields[model.foreign.module][row[field.name][i]];
                            if (res) {
                                result = <span>
                                    {result}{' '}
                                    <Link to={model.foreign.path + "/edit/" + row[field.name][i]} target="_blank" rel="noopener noreferrer" className="btn btn-info" style={{marginBottom: "5px"}}>{res}</Link>
                                </span>;
                            }
                        }
                    }
                }
                break;
            case "foreign":
            case "select_search":
                if (foreignFields && foreignFields[model.foreign.module] && foreignFields[model.foreign.module][row[field.name]]) {
                    result = <Link
                        to={model.foreign.path + "/edit/" + row[field.name]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-info"
                        style={{marginBottom: "5px"}}
                    >
                        {foreignFields[model.foreign.module][row[field.name]]}
                    </Link>;
                }
                break;
            case "conditional_foreign":
                // TODO: correct this
                // if(foreignFields && foreignFields[field.name] && foreignFields[field.name][model.foreign.value[row[model.foreign.field]].module] && foreignFields[field.name][model.foreign.value[row[model.foreign.field]].module][row[field.name]]){
                //     result = <Link
                //         to={model.foreign.value[row[model.foreign.field]].path + "/edit/" + foreignFields[field.name][model.foreign.value[row[model.foreign.field]].module][row[field.name]].id}
                //         target="_blank"
                //         rel="noopener noreferrer"
                //         className="btn btn-info"
                //         style={{marginBottom: "5px"}}
                //     >
                //         {foreignFields[field.name][model.foreign.value[row[model.foreign.field]].module][row[field.name]].value}
                //     </Link>
                // }
                break;
            case "multiple":
                for(let i = 0; i < field.result.length; i++){
                    if(field.result[i].title){
                        result = <span>{result}<span>{field.result[i].title + " : "}</span></span>;
                    }
                    result = <span>{result}<span>{this.processField(row, field.result[i])}</span></span>;
                }
                break;
            case "select":
                let a = model.items.filter(item => item.key === row[field.name])[0];
                if(a) result = a.value;
                else result = '';
                break;
            case "function":
                result = field.value.func(field.value.params.map(param => row[param]));
                break;
            case "static":
                result = field.value;
                break;
            default:
                result = row[field.name];
        }
        if(field.max_length){
            if(row[field.name]){
                result = row[field.name].length > field.max_length ? result.substring(0, field.max_length) + "..." : result;
            }
        }
        if(field.alias){
            result = row[field.alias];
        }
        if(!result){
            result = '';
        }
        return result;
    }
    
    model = (field) => {
        let model = this.props.base.model[field.name];
        if(!model) model = field;
        return model;
    };

    render(){
        const {rows, pagination, message, remove_loading, show_image, show_images, photo_index, confirm_loading, search, search_items, search_loading, count, perPage, show_confirmed} = this.state;
        const {fields, operations, custom_operations, custom_add, operations_style, export_fields} = this.props.data;
        const {entities, entity, path, confirm_field, confirm_other_fields} = this.props.base;
        const search_data = this.props.data.search;

        return (
            <div>
                {!this.props.base.picker &&
                    <span>
                        <h2>{entities}</h2>
                        {message}
                        <div className="row">
                            <div className="col-md-4">
                                {operations && operations.indexOf("add") > -1 && (
                                    custom_add ?
                                        <Button
                                            variant={custom_add.class}
                                            onClick={custom_add.click.func}
                                        >
                                            {custom_add.caption}
                                        </Button>
                                        :
                                        <a href={path + "/add"}><Button variant="primary">افزودن {entity} جدید</Button></a>
                                )}
                            </div>
                            <div className="col-md-4" style={{textAlign: "center"}}>
                                تعداد : {count}
                                {confirm_field &&
                                    <div>
                                        <Form.Check type="radio" name="show_confirmed" value="1" inline checked={parseInt(show_confirmed) === 1}
                                               onChange={this.showConfirmed}>
                                            همه
                                        </Form.Check>{' '}
                                        <Form.Check type="radio" name="show_confirmed" value="2" inline checked={parseInt(show_confirmed) === 2}
                                               onChange={this.showConfirmed}>
                                            تأیید شده
                                        </Form.Check>{' '}
                                        <Form.Check type="radio" name="show_confirmed" value="3" inline checked={parseInt(show_confirmed) === 3}
                                               onChange={this.showConfirmed}>
                                            تأیید نشده
                                        </Form.Check>
                                    </div>
                                }
                            </div>
                            <div className="col-md-4 form-inline" style={{textAlign: "left", display: "block"}}>
                                تعداد نمایش در هر صفحه :&nbsp;
                                <select className="form-control" name="perPage" value={perPage} onChange={this.handleChangePerPage}>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                    <option value={200}>200</option>
                                    <option value={500}>500</option>
                                    <option value={1000}>1000</option>
                                </select>
                            </div>
                        </div>
                        <div style={{height: "10px"}}/>
                    </span>
                }
                {search_data &&
                <Accordion id="search-panel">
                    <Card>
                        <Card.Header>
                            <Accordion.Toggle as={Button} variant="link" eventKey="0">
                                جستجو
                            </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body>
                                <Form onSubmit={this.handleSearch}>
                                    {search_data.map(s =>
                                        <Form.Group key={s.name}>
                                            {s.component_type === "text" &&
                                            <Form.Control
                                                type="text"
                                                name={s.name}
                                                value={search[s.value]}
                                                placeholder={s.placeholder}
                                                onChange={this.handleChangeSearch}
                                            />
                                            }
                                            {s.component_type === "between" &&
                                                <Row>
                                                    <Col sm={6}>
                                                        <Form.Control
                                                            type="text"
                                                            name={s.name + "_from"}
                                                            value={search[s.value + "_form"]}
                                                            placeholder={s.placeholder + " از"}
                                                            onChange={this.handleChangeSearch}
                                                        />
                                                    </Col>
                                                    <Col sm={6}>
                                                        <Form.Control
                                                            type="text"
                                                            name={s.name + "_to"}
                                                            value={search[s.value + "_to"]}
                                                            placeholder={s.placeholder + " تا"}
                                                            onChange={this.handleChangeSearch}
                                                        />
                                                    </Col>
                                                </Row>
                                            }
                                            {s.component_type === "select" &&
                                            <Form.Control
                                                componentClass="select"
                                                name={s.name}
                                                value={search[s.value]}
                                                placeholder={s.placeholder}
                                                onChange={this.handleChangeSearch}
                                            >
                                                <option value="">-</option>
                                                {s.source_data && s.source_data.map(source_item =>
                                                    <option value={source_item.key}>{source_item.value}</option>
                                                )}
                                            </Form.Control>
                                            }
                                            {s.component_type === "user" &&
                                                <span>
                                                    {s.title && <Form.Label>{s.title}</Form.Label>}
                                                    <PickUser changeUser={this.handleChangeUser} idField={s.field} nameField="" />
                                                </span>
                                            }
                                            {s.component_type === "checkbox" &&
                                            <Form.Check name={s.name} checked={search[s.value]} onChange={this.handleChangeSearch}>{s.title}</Form.Check>
                                            }
                                        </Form.Group>
                                    )}
                                    <Button type="submit" variant="info" onClick={this.handleSearch} disabled={search_loading}>
                                        {search_loading ? loadingGif : 'جستجو'}
                                    </Button>
                                    <div>
                                        {Object.values(search_items).map(item =>
                                            <div className="search-item">{item[1]} <Button variant="danger" bsSize="xsmall" onClick={() => this.removeSearchItem(item[0])}>×</Button></div>
                                        )}
                                    </div>
                                </Form>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
                }
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            {fields && fields.map(field => <th key={this.model(field).title}>{field.name ? <span className="link" onClick={() => {
                                let order_asc = this.state.order_asc;
                                if(field.name === this.state.order){
                                    order_asc *= -1;
                                }else{
                                    order_asc = 1;
                                }
                                this.getRows(1, field.name, order_asc);
                            }}>
                                {this.model(field).title} {
                                    field.name === this.state.order ?
                                        this.state.order_asc === 1 ?
                                            <span className="glyphicon glyphicon-triangle-top"/>
                                            :
                                            <span className="glyphicon glyphicon-triangle-bottom"/>
                                        :
                                        ''
                                }
                            </span> : this.model(field).title}</th>)}
                            <th style={operations_style || {width: "150px"}}>عملیات</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows ?
                            rows.map((row) => {
                                return (
                                    <tr key={key.tr++}>
                                        {fields && fields.map(field =>
                                            {

                                                return(
                                                    <td key={key.td++} title={field.max_length ? row[field.name] : ""}
                                                        style={field.style}>
                                                        {this.processField(row, field)}
                                                    </td>
                                                )
                                            }
                                        )}
                                        <td>
                                            {custom_operations && custom_operations.map(op =>
                                                    <span><Button
                                                        variant={op.class}
                                                        onClick={() => {
                                                            let params = {};
                                                            for (let i = 0; i < op.click.params.length; i++) {
                                                                if (op.click.params[i].type === "text") {
                                                                    params[op.click.params[i].name] = op.click.params[i].value;
                                                                } else {
                                                                    params[op.click.params[i]] = row[op.click.params[i]];
                                                                }
                                                            }
                                                            op.click.func(params);
                                                        }}
                                                        title={op.title}
                                                    >
                                                {op.caption}
                                            </Button>{' '}</span>
                                            )}
                                            {operations && operations.indexOf("confirm") > -1 && (
                                                !confirm_loading[row.id] ?
                                                    row[confirm_field] ?
                                                        <span><Button
                                                            variant="success"
                                                            title="خارج کردن از حالت تأیید"
                                                            onClick={() => {
                                                                let params = {
                                                                    id: row.id,
                                                                    confirmed: false
                                                                };
                                                                if (confirm_other_fields) {
                                                                    let otherField = '';
                                                                    for (let i = 0; i < confirm_other_fields.length; i++) {
                                                                        otherField = confirm_other_fields[i];
                                                                        if (otherField.name) {
                                                                            if (otherField.name.indexOf('.') > -1) {
                                                                                //TODO: add support for multilevel nested fields (now it's just two level nested fields)
                                                                                let otherFieldArray = otherField.name.split('.');
                                                                                params[otherField.alias] = row[otherFieldArray[0]][otherFieldArray[1]];
                                                                            } else {
                                                                                params[otherField.alias] = row[otherField.name];
                                                                            }
                                                                        } else {
                                                                            params[confirm_other_fields[i]] = row[confirm_other_fields[i]];
                                                                        }
                                                                    }
                                                                }
                                                                this.confirm(params);
                                                            }}
                                                        >
                                                        <span className="glyphicon glyphicon-ok"/>
                                                    </Button>{' '}</span> :
                                                        <span><Button
                                                            variant="danger"
                                                            title={"تأیید " + entity}
                                                            onClick={() => {
                                                                let params = {
                                                                    id: row.id,
                                                                    confirmed: true
                                                                };
                                                                if (confirm_other_fields) {
                                                                    let otherField = '';
                                                                    for (let i = 0; i < confirm_other_fields.length; i++) {
                                                                        otherField = confirm_other_fields[i];
                                                                        if (otherField.name) {
                                                                            if (otherField.name.indexOf('.') > -1) {
                                                                                //TODO: add support for multilevel nested fields (now it's just two level nested fields)
                                                                                let otherFieldArray = otherField.name.split('.');
                                                                                params[otherField.alias] = row[otherFieldArray[0]][otherFieldArray[1]];
                                                                            } else {
                                                                                params[otherField.alias] = row[otherField.name];
                                                                            }
                                                                        } else {
                                                                            params[confirm_other_fields[i]] = row[confirm_other_fields[i]];
                                                                        }
                                                                    }
                                                                }
                                                                this.confirm(params);
                                                            }}
                                                        >
                                                        <span className="glyphicon glyphicon-remove"/>
                                                    </Button>{' '}</span> :
                                                    <span><Button variant="default">{loadingGif}</Button>{' '}</span>
                                            )}
                                            {operations && operations.indexOf("edit") > -1 &&
                                            <a href={path + "/edit/" + row.id}><Button variant="info" title="ویرایش"><span
                                                className="glyphicon glyphicon-pencil"/></Button>{' '}</a>}
                                            {operations && operations.indexOf("remove") > -1 && (
                                                !remove_loading[row.id] ?
                                                    <Button variant="danger" title="حذف" onClick={(e) => {
                                                        this.remove(row.id, e)
                                                    }}><span className="glyphicon glyphicon-trash"/></Button> :
                                                    <Button variant="danger">{loadingGif}</Button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            }) :
                            <tr>
                                <td colSpan={fields.length + 1}>{loadingGif} در حال دریافت اطلاعات ...</td>
                            </tr>
                        }
                        </tbody>
                    </table>
                </div>
                {pagination}
                {show_image && (
                    <LightBox
                        mainSrc={this.image}
                        onCloseRequest={() => this.setState({ show_image: false })}
                    />
                )}
                {show_images && (
                    <LightBox
                        mainSrc={this.images[photo_index]}
                        nextSrc={this.images[(photo_index + 1) % this.images.length]}
                        prevSrc={this.images[(photo_index + this.images.length - 1) % this.images.length]}
                        onCloseRequest={() => this.setState({show_images: false})}
                        onMovePrevRequest={() =>
                            this.setState({
                                photo_index: (photo_index + this.images.length - 1) % this.images.length,
                            })
                        }
                        onMoveNextRequest={() =>
                            this.setState({
                                photo_index: (photo_index + 1) % this.images.length,
                            })
                        }
                    />
                )}
                {!this.props.base.picker && <p>&nbsp;</p>}
            </div>
        );
    }
}