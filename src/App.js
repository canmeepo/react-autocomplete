import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import geoNames from './kladr.json';

const { addons, Children, cloneElement, Component } = React;
const { findDOMNode, PropTypes } = ReactDOM;

const classSet = addons;

const keys = {
  down: 'ArrowDown',
  enter: 'Enter',
  up: 'ArrowUp'
};

class AutoComplete extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputWidth: null,
      selectedSuggestion: 0,
      showSuggestions: false,
      shownOptions: [],
      nativeSupport: this._supportsNative(),
      options: props.options,
      value: ''
    };
  }

  componentDidMount() {
    if (this.state.nativeSupport) {
      return;
    }

    let inputWidth = findDOMNode(this.refs.input).offsetWidth + 'px';

    this.setState({ inputWidth });
  }

  _supportsNative() {
    let feature = document.createElement('datalist');

    return Boolean(feature && feature.options);
  }

  _isOptionShown(input, option) {
    let optionRegex = new RegExp(input, 'gi');
    let optionMatchesInput = input && option.match(optionRegex);

    return this.state.showSuggestions && optionMatchesInput;
  }

  _renderFallbackOptions() {
    let options = this.state.shownOptions.map((option, index) => {
      let isSelected = index === this.state.selectedSuggestion;
      let classNames = classSet({
        lookahead__option: true,
        'lookahead__option--selected': isSelected
      });
      let onClick = this.onFallbackOptionClick.bind(this, option);

      return (
        <li
          className={classNames}
          aria-selected={isSelected}
          key={index}
          onMouseDown={onClick}
          role="option"
        >
          {option}
        </li>
      );
    });

    let classNames = classSet({
      'lookahead__fallback-options': true,
      'lookahead__fallback-options--shown': this.state.showSuggestions && this.state.value
    });

    return (
      <ul
        aria-multiselectable="false"
        className={classNames}
        role="listbox"
        style={{ width: this.state.inputWidth }}
      >
        {options}
      </ul>
    );
  }

  _renderOptions() {
    if (!this.state.nativeSupport) {
      return this._renderFallbackOptions();
    }

    let options = this.state.options.map((option, index) => {
      return <option key={index} value={option} />;
    });

    return (
      <datalist id={this.props.name}>
        {options}
      </datalist>
    );
  }

  _renderChildren() {
    let child = Children.only(this.props.children);
    let props = {
      list: this.props.name,
      onBlur: this.onBlur.bind(this),
      onChange: this.onChange.bind(this),
      ref: 'input',
      value: this.state.value
    };

    if (!this.state.nativeSupport) {
      props.onKeyDown = this.onKeyDown.bind(this);
    }

    return cloneElement(child, props);
  }

  onKeyDown(event) {
    const { key } = event;
    const { selectedSuggestion, shownOptions } = this.state;
    let nextIndex = selectedSuggestion;

    switch (key) {
      case keys.down:
        let maxIndex = shownOptions.length - 1;
        nextIndex = selectedSuggestion === maxIndex ? maxIndex : selectedSuggestion + 1;
        break;
      case keys.up:
        nextIndex = selectedSuggestion <= 0 ? 0 : selectedSuggestion - 1;
        break;
      case keys.enter:
        this.onFallbackOptionClick(shownOptions[selectedSuggestion]);
        break;
      default:
        return;
    }

    this.setState({ selectedSuggestion: nextIndex });
  }

  onFallbackOptionClick(option) {
    this.setState({ showSuggestions: false, value: option });
  }

  onBlur() {
    this.setState({ showSuggestions: false });
  }

  onChange(event) {
    let { value } = event.target;
    let newState = { selectedSuggestion: 0, value };

    if (!this.state.nativeSupport) {
      newState.showSuggestions = true;
      newState.shownOptions = this.state.options.filter(option =>
        this._isOptionShown(value, option)
      );
    }

    this.setState(newState);
  }

  render() {
    return (
      <section className="lookahead">
        {this._renderChildren()}
        {this._renderOptions()}
      </section>
    );
  }
}

AutoComplete.propTypes = {
  name: PropTypes.string.isRequired
};

class App extends Component {
  render() {
    return (
      <label>
        Город:
        <AutoComplete name="city" options={geoNames.City}>
          <input placeholder="Начните вводить" />
        </AutoComplete>
      </label>
    );
  }
}

export default App;
