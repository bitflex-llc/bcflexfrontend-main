import React from 'react'
import { Navigate, Route } from 'react-router-dom'

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} element={(
        localStorage.getItem('access_token')
            ? <Component  />
            : <Navigate to={{ pathname: '/signin' }}  />
    )} />
)

export default PrivateRoute