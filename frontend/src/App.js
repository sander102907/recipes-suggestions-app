import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import { Button, Container, Card, Row } from 'react-bootstrap'
import IngredientsSearchBar from "./components/searchIngredients/searchIngredients";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recipes: [],
      newRecipeName: '',
      updateRecipeName: '',
      ingredients: []
    }
  }

  handleChange = (event) => {
    let nam = event.target.name;
    let val = event.target.value
    this.setState({
      [nam]: val
    })
  }
  
  handleChange2 = (event) => {
    this.setState({
      updateRecipeName: event.target.value
    })
  }

  updateRecipes = (oldRecipesList, id, newName) => {
    return oldRecipesList.map((item) => {
      if (item.id === id) {
        const updatedItem = {
          ...item,
          name: newName,
        };

        return updatedItem;
      }  
    return item;
    });
  }
  
  componentDidMount() {
    axios.get("/api/recipes")
        .then((response) => {
            this.setState({
              recipes: response.data
            })
        })
  }
  
  submit = () => {
    const newRecipe = {
      name: this.state.newRecipeName
    };

    axios.post('/api/recipe', newRecipe)
        .then(response => { 
          this.setState(prevState =>({
          recipes: [...prevState.recipes, response.data],
          newRecipeName: ''
        })) 
      })
  }
  
  delete = (id) => {
    if (window.confirm("Do you want to delete? ")) {
        axios.delete(`/api/recipe/${id}`).then(() => {
          this.setState(prevState =>({
            recipes: prevState.recipes.filter((item) => item.id !== id)
          }))
        })
    }
  }
  
  edit = (id) => {
    const updateRecipe = {
      name: this.state.updateRecipeName
    };

    axios.put(`/api/recipe/${id}`, updateRecipe).then(response => {
      this.setState(prevState =>({
        recipes: this.updateRecipes(prevState.recipes, id, response.data.name),
        updateRecipeName: ''
      }))
    })
  }


  render() {
    let card = this.state.recipes.map((val, key) => {
        return (
            <React.Fragment>
                <Card style={{ width: '18rem' }} className='m-2'>
                    <Card.Body>
                        <Card.Title>{val.name}</Card.Title>
                        <input name='updateRecipeName' onChange={this.handleChange2} placeholder='Update Recipe' ></input>
                        <Button className='m-2' onClick={() => { this.edit(val.id) }}>Update</Button>
                        <Button onClick={() => { this.delete(val.id) }}>Delete</Button>
                    </Card.Body>
                </Card>
            </React.Fragment>
        )
    })
  
    return (
        <div className='App'>
            <h1>Dockerized Fullstack React Application</h1>
            <IngredientsSearchBar />
            <div className='form'>
                <input name='newRecipeName' placeholder='Enter Recipe Name' onChange={this.handleChange} />
            </div>
            <Button className='my-2' variant="primary" onClick={this.submit}>Submit</Button> <br /><br />
            <Container>
                <Row>
                    {card}
                </Row>
            </Container>
        </div>
    );
  }
}

export default App;