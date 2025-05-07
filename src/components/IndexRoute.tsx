import { Navigate, Route } from 'react-router-dom'

const IndexRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} element={(
        <Navigate to={{ pathname: '/terminal' }} />
    )} />
)

export default IndexRoute