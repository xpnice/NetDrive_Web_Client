import React, { useState, useEffect } from 'react';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import validate from 'validate.js';
import { makeStyles } from '@material-ui/styles';
import store from '../../store';
import {
  Grid,
  Button,
  TextField,
  Link,
  Typography
} from '@material-ui/core';
import CircularIndeterminate from '../loading.js'
import md5 from 'md5'
import config from 'config.json'
import { notification } from 'antd'


const schema = {
  email: {
    presence: { allowEmpty: false, message: 'is required' },
    email: true,
    length: {
      maximum: 64
    }
  },
  password: {
    presence: { allowEmpty: false, message: 'is required' },
    length: {
      maximum: 128
    }
  }
};

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.default,
    height: '100%'
  },
  grid: {
    height: '100%'
  },
  quoteContainer: {
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  quote: {
    backgroundColor: theme.palette.neutral,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // eslint-disable-next-line no-undef
    backgroundImage: 'url(' + process.env.PUBLIC_URL + '/images/jj.jpg)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  },
  content: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  contentHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(5),
    paddingBototm: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  logoImage: {
    marginLeft: theme.spacing(4)
  },
  contentBody: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'center'
    }
  },
  form: {
    paddingLeft: 100,
    paddingRight: 100,
    paddingBottom: 125,
    flexBasis: 700,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
    }
  },
  title: {
    marginTop: theme.spacing(3)
  },
  socialButtons: {
    marginTop: theme.spacing(3)
  },
  socialIcon: {
    marginRight: theme.spacing(1)
  },
  sugestion: {
    marginTop: theme.spacing(2)
  },
  textField: {
    marginTop: theme.spacing(2)
  },
  signInButton: {
    margin: theme.spacing(2, 0)
  }
}));
const SignIn = props => {
  const { history } = props;

  const classes = useStyles();

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {},
    loading: false
  });

  useEffect(() => {
    const errors = validate(formState.values, schema);

    setFormState(formState => ({
      ...formState,
      isValid: errors ? false : true,
      errors: errors || {}
    }));
  }, [formState.values]);



  const handleChange = event => {
    event.persist();

    setFormState(formState => ({
      ...formState,
      values: {
        ...formState.values,
        [event.target.name]:
          event.target.type === 'checkbox'
            ? event.target.checked
            : event.target.value
      },
      touched: {
        ...formState.touched,
        [event.target.name]: true
      }
    }));
  };

  async function handleSignIn(event) {
    var Console = console;
    event.preventDefault();
    setFormState(formState => ({
      ...formState,
      loading: true
    }));
    const url = 'http://'+config.server_addr+':'+config.server_port;
    const data = { process: 'signin', username: formState.values.email, password: md5(formState.values.password) };
    try {
      const response = await fetch(url, {
        method: 'POST', // or 'PUT'
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const json = await response.json();

      if (json.status === 'WRONG') {
        notification.error({
          message: '账号或密码错误',
          description:
            '请检查账号密码输入是否正确，如果没有账号请注册',
          placement: 'bottomRight'
        });
        setFormState(formState => ({
          ...formState,
          loading: false
        }));
      }
      if (json.status === 'OK') {
        Console.log('登录成功:', formState.values.email);
        store.dispatch({ type: 'signin', username: formState.values.email,tree:json.tree })
        var user_info = { username: formState.values.email };
        var path = {
          pathname: '/dashboard',
          query: user_info,
        }
        history.push(path);
      }
    } catch (error) {
      Console.error('Error:', error);
      alert('与服务器连接失败，请稍后重试!')
      setFormState(formState => ({
        ...formState,
        loading: false
      }));
    }


  }

  const hasError = field =>
    formState.touched[field] && formState.errors[field] ? true : false;
  return (
    <div className={classes.root}>
      <Grid
        className={classes.grid}
        container
      >
        <Grid
          className={classes.quoteContainer}
          item
          lg={5}
        >
          <div className={classes.quote} />
        </Grid>
        <Grid
          className={classes.content}
          item
          lg={7}
          xs={12}
        >
          <div className={classes.content}>
            <div className={classes.contentHeader} />
            <div className={classes.contentBody}>
              <form
                className={classes.form}
                onSubmit={handleSignIn}
              >
                <Typography
                  className={classes.title}
                  variant="h2"
                >
                  Sign in
                </Typography>
                <TextField
                  className={classes.textField}
                  error={hasError('email')}
                  fullWidth
                  helperText={
                    hasError('email') ? formState.errors.email[0] : null
                  }
                  label="Email address"
                  name="email"
                  onChange={handleChange}
                  type="text"
                  value={formState.values.email || ''}
                  variant="outlined"
                />
                <TextField
                  className={classes.textField}
                  error={hasError('password')}
                  fullWidth
                  helperText={
                    hasError('password') ? formState.errors.password[0] : null
                  }
                  label="Password"
                  name="password"
                  onChange={handleChange}
                  type="password"
                  value={formState.values.password || ''}
                  variant="outlined"
                />
                <Button
                  className={classes.signInButton}
                  color="primary"
                  disabled={(formState.loading ^ formState.isValid) ? false : true}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"

                >
                  {formState.loading ? <CircularIndeterminate /> : 'Sign in now'}
                </Button>
                <Typography
                  color="textSecondary"
                  variant="body1"
                >
                  Don't have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/sign-up"
                    variant="h6"
                  >
                    Sign up
                  </Link>
                </Typography>
              </form>
            </div>
          </div>
        </Grid>
      </Grid>
    </div >
  );
};

SignIn.propTypes = {
  history: PropTypes.object
};

export default withRouter(SignIn);
