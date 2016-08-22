const path = require('path');
const morgan = require('morgan');
const express = require('express');
const passport = require('passport');
const parser = require('body-parser');

module.exports = (app) => {
  app.use(morgan('dev'));
  app.use(parser('dev'));
};
