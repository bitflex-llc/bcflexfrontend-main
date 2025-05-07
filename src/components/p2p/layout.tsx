
import { NavMenu } from "../NavMenu";
import { NavSideMenu } from "../NavSideMenu";


export function Layout({ children }): JSX.Element {

    return (
        <div className="bf-dashboard-container">
            <NavMenu />
            <div className="bf-dashboard-content" style={{minHeight:'90vh', margin: 4}}>
                {children}
            </div>
        </div>
    );
}