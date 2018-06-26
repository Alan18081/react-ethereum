import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import lottery from './lottery';

import Spinner from './Spinner';

class App extends Component {
  state = {
    manager: '',
    players: 0,
    balance: '',
    value: '',
    enterMessage: '',
    pickMessage: '',
    error: '',
    entering: false,
    picking: false,
    winner: '',
    isManager: false
  };
  async loadContractData() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    this.setState({
      manager,
      players: players.length,
      balance
    });
  }
  async componentDidMount() {
    await this.loadContractData();
    const [user] = await web3.eth.getAccounts();
    this.setState({
      ...this.state,
      isManager: user === this.state.manager
    });
  }
  onSubmit = async event => {
    try {
      event.preventDefault();
      const accounts = await web3.eth.getAccounts();
      this.setState({
        ...this.state,
        entering: true,
        error: '',
        enterMessage: ''
      });
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(this.state.value,'ether')
      });
      this.setState({
        ...this.state,
        entering: false,
        enterMessage: 'You have successfully been entered'
      });
      await this.loadContractData();
    }
    catch(error) {
      this.setState({
        ...this.state,
        entering: false,
        error: 'Transaction denied'
      })
    }
  };
  pickWinner = async () => {
    const accounts = await web3.eth.getAccounts();
    this.setState({
      ...this.state,
      pickMessage: '',
      picking: true
    });
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });
    await this.loadContractData();
    const winner = await lottery.methods.winner().call();
    this.setState({
      ...this.state,
      pickMessage: 'Winner is picked',
      winner
    });
  };
  render() {
    const {
      manager,
      balance,
      players,
      error,
      picking,
      pickMessage,
      entering,
      enterMessage,
      isManager
    } = this.state;
    return (
      <div className="container">
        <h2>Lottery contract</h2>
        <p>This contract is managed by {manager}</p>
        <p>We already have {players} players</p>
        <p>Amount of money {web3.utils.fromWei(balance,'ether')} ether</p>
        <div className="card">
          <form onSubmit={this.onSubmit} className="card-body">
            <h4>Want to try your luck?</h4>
            <fieldset className="form-group">
              <strong>Amount of ether</strong>
              <input
                className="form-control"
                type="text"
                value={this.state.value}
                onChange={event => this.setState({value: event.target.value})}/>
            </fieldset>
            {entering && <Spinner/>}
            {error && <div className="alert alert-danger">{error}</div>}
            {enterMessage && <div className="alert alert-success">{enterMessage}</div>}
            <button className="btn btn-outline-primary">Enter</button>
          </form>
        </div>
        {isManager && <div className="card">
          <div className="card-body">
            <h4>Ready to pick a winner?</h4>
            {picking && <Spinner/>}
            {pickMessage && <div>{pickMessage}</div>}
            <button className="btn btn-outline-success" onClick={this.pickWinner}>Pick a winner</button>
          </div>
        </div>}
      </div>
    );
  }
}

export default App;
