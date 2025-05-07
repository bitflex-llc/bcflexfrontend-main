
import { NavMenu } from "../NavMenu";
import { NavSideMenu } from "../NavSideMenu";
import "./assets/css/plugins.css"
import "./assets/css/style.css";


export function Layout({ children }) {
  
    return (
        <div className="metaportal_fn_main">
            <NavMenu />
            <div className="metaportal_fn_content" style={{ minHeight: '90vh' }}>
                {children}
            </div>
        </div>
    );
   
}