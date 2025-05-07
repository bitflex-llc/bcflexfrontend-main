
import { NavMenu } from "../NavMenu";
import { NavSideMenu } from "../NavSideMenu";

import "./assets/app.css";



export function Layout({ children }) {
    
    return (
        <div className="bf-dashboard-container">
            <NavMenu />
            <div className="bf-dashboard-content" style={{minHeight:'90vh'}}>
                {children}
            </div>
        </div>
    );

}