import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import geoNames from './kladr.json';
import PropTypes from 'prop-types';

console.clear();

class Api {
  static getResults(keyword) {
    return fetch('./kladr.json').then(res => {
      return res.json();
    });
  }
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      results: [],
      autoCompleteIndex: -1,
      selectedIndex: -1
    };
  }

  render() {
    let selectedValue = this.state.results[this.state.selectedIndex];

    return (
      <div className="app">
        <SearchInput
          onChange={this._onChange.bind(this)}
          onKeyDown={this._onKeyDown.bind(this)}
          value={selectedValue}
        />
        <AutoCompleteDropdown
          results={this.state.results}
          highlightedIndex={this.state.autoCompleteIndex}
        />
      </div>
    );
  }

  _onChange(e) {
    this.setState({
      autoCompleteIndex: -1,
      selectedIndex: -1
    });

    let searchValue = e.currentTarget.value;
    Api.getResults(searchValue).then(results => {
      this.setState({
        results: results.data
      });
    });
  }

  _onKeyDown(e) {
    var newIndex = this.state.autoCompleteIndex;
    var newSelectedIndex = this.state.selectedIndex;

    if (e.keyCode === 13 || (e.keyCode === 9 && newIndex > -1)) {
      newSelectedIndex = newIndex;
    } else if (e.keyCode === 40) {
      newIndex = this.state.autoCompleteIndex + 1;
    } else if (e.keyCode === 38) {
      newIndex = this.state.autoCompleteIndex - 1;
    }

    if (newIndex !== this.state.autoCompleteIndex) {
      //e.preventDefault();

      if (newIndex === -1) {
        newIndex = this.state.results.length - 1;
      } else if (newIndex === this.state.results.length) {
        newIndex = 0;
      }
    }

    this.setState({
      autoCompleteIndex: newIndex,
      selectedIndex: newSelectedIndex
    });
  }
}

class AutoCompleteDropdown extends React.Component {
  render() {
    return (
      <ul className="results">
        {this.props.results.map((result, index) => {
          let className = index === this.props.highlightedIndex ? 'result selected' : 'result';

          return (
            <li className={className}>
              {result}
            </li>
          );
        })}
      </ul>
    );
  }
}
AutoCompleteDropdown.propTypes = {
  results: React.PropTypes.array,
  highlightedIndex: React.PropTypes.number
};

class SearchInput extends React.Component {
  constructor() {
    super();

    this.state = {
      value: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  }

  render() {
    return (
      <input
        type="search"
        value={this.state.value}
        onChange={this._onChange.bind(this)}
        onKeyDown={this.props.onKeyDown}
      />
    );
  }

  _onChange(e) {
    this.setState({
      value: e.currentTarget.value
    });

    this.props.onChange(e);
  }
}
SearchInput.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  onKeyDown: React.PropTypes.func.isRequired,
  value: React.PropTypes.string
};

export default App;
