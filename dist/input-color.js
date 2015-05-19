'use strict';

var cx = require('classnames');
var React = require('react');
var objectAssign = require('object-assign');
var colorParser = require('color-parser');

var ColorPicker = require('./color-picker.js');
var rgbaColor = require('color-functions/lib/rgba');
var rgb2hsv = require('color-functions/lib/rgb2hsv');
var rgb2hex = require('color-functions/lib/rgb2hex');

var KEY_ENTER = 13;

function getColor(cssColor) {
  var rgba = colorParser(cssColor);
  var r = rgba.r,
      g = rgba.g,
      b = rgba.b,
      a = rgba.a * 100;
  var hsv = rgb2hsv(r, g, b);

  return objectAssign(hsv, {
    r: r,
    g: g,
    b: b,
    a: a,
    hex: rgb2hex(r, g, b)
  });
}

module.exports = React.createClass({
  displayName: 'InputColor',

  getInitialState: function getInitialState() {
    var cssColor = this.props.value;

    return {
      color: getColor(this.props.value),
      colorPicker: false,
      colorPickerPosition: 0
    };
  },

  render: function render() {
    var color = this.state.color;
    var r = color.r,
        g = color.g,
        b = color.b,
        a = color.a;
    var rgbaBackground = rgbaColor(r, g, b, a);

    return React.createElement(
      'span',
      { className: cx({
          'm-input-color': true,
          'color-picker-open': this.state.colorPicker
        }), onClick: this._onClick },
      React.createElement('span', { className: 'css-color',
        style: { background: rgbaBackground } }),
      this.state.colorPicker ? React.createElement(ColorPicker, {
        left: this.state.colorPickerPosition,
        color: this.state.color,
        onChange: this._onChange }) : null
    );
  },

  componentDidMount: function componentDidMount() {
    document.addEventListener('click', this.closeColorPicker, false);
  },

  componentWillUnmount: function componentWillUnmount() {
    document.removeEventListener('click', this.closeColorPicker);
  },

  closeColorPicker: function closeColorPicker() {
    this.setState({ colorPicker: false });
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var cssColor = nextProps.value;

    // anti-pattern, maybe
    if (!this._updated) {
      this.setState({
        color: getColor(cssColor)
      });
    } else {
      this._updated = false;
    }
  },

  change: function change(cssColor) {
    if (this.props.onChange) {
      this.props.onChange(cssColor);
    }
  },

  _onChange: function _onChange(color) {
    this.setState({
      cssColor: '#' + color.hex,
      color: color
    });
    this._updated = true;
    this.change('#' + color.hex);
  },

  _onClick: function _onClick(e) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    var dom = React.findDOMNode(this);
    var rect = dom.getBoundingClientRect();
    var ww = window.innerWidth;

    var left = -105;
    if (rect.right + 105 > ww) {
      left = -210 + ww - rect.right;
    } else if (rect.left - 105 < 0) {
      left = -rect.left;
    }

    this.setState({
      colorPicker: !this.state.colorPicker,
      colorPickerPosition: left
    });
  }
});