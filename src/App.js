import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import NavBar from './components/NavBar';
import AddProductForm from './components/AddProductForm';
import Products from './components/Products';
import Order from './components/Order';


const App = () => {
  return (
    <div className="App">
      <NavBar />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/orders" component={Order} />
        <Route path="/add_product" component={AddProductForm} />
        
      </Switch>
    </div>
  );
}

export default App;
