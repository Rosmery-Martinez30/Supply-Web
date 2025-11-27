
import { Routes, Route } from "react-router-dom";

function Router() {
    return (
        <Routes>
            <Route path="/Login"  />
            <Route path="/User"  />
            <Route path="/Customer"  />
            <Route path="/Category"  />
            <Route path="/Shopping"  />
            <Route path="/Suppliers"  />
        </Routes>
    );
}

export default Router;