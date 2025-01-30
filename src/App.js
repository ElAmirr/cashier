import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect, BrowserRouter as Router } from 'react-router-dom';
import Home from './components/Home';
import NavBar from './components/NavBar';
import AddProductForm from './components/AddProductForm';
import Products from './components/Products';
import Checkout from './components/Checkout';
import Orders from './components/Orders';
import Clients from './components/Clients';
import FullScreen from './components/FullScreen';
import Reports from './components/Reports';
import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';

// Protected Route component
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const token = localStorage.getItem('token'); // Check if the token exists

  return (
    <Route
      {...rest}
      render={(props) =>
        token ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is logged in by verifying the token
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // Set authentication state
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token on logout
    localStorage.removeItem('tenant_id');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <FullScreen />
        {isAuthenticated && <NavBar onLogout={handleLogout} />}
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/signup" component={SignupForm} />
          <Route
            path="/login"
            render={(props) => <LoginForm {...props} onLogin={handleLogin} />}
          />
          <ProtectedRoute path="/products" component={Products} />
          <ProtectedRoute path="/checkout" component={Checkout} />
          <ProtectedRoute path="/add_product" component={AddProductForm} />
          <ProtectedRoute path="/clients" component={Clients} />
          <ProtectedRoute path="/orders" component={Orders} />
          <ProtectedRoute path="/reports" component={Reports} />
          <Redirect to="/" />
        </Switch>
      </div>
    </Router>
  );
};

export default App;
