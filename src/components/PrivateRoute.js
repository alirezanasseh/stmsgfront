import React, { Component } from 'react';
import {Redirect, Route} from 'react-router-dom';

export default class PrivateRoute extends Component {
    render(){
        const { component: Component, auth: isAuthenticated, ...restProps } = this.props;
        return <Route {...restProps} render={(props) => (
            isAuthenticated ? (
                <Component { ...props} />
            ) : (
                <Redirect to={{pathname: '/login', state: {from: props.location}}}/>
            )
        )} />
    }
}