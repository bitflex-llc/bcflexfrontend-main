import { NavMenu } from './NavMenu';
import { NavSideMenu } from './NavSideMenu';

export function ProfileLayout({ children }) {
    return (
        <div className="bf-dashboard-container">
            <NavMenu />
            <div className="bf-dashboard-content">
                <div className="bf-dashboard-sidemenu-container">
                    <NavSideMenu />
                </div>
                <div className="bf-dashboard-content-container scrollable-bf">
                    <div className="bf-dashboard-con dash-text-content">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}