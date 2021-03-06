import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';
import {
  LatestSales,
  TreeContent
} from './components';
import store from 'store'
const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2)
  }
}));

const Dashboard = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={2}
      >
        <Grid
          item
          lg={3}
          md={4}
          xl={4}
          xs={12}
        >
          <TreeContent store={store} />
        </Grid>
        <Grid
          item
          lg={9}
          md={8}
          xl={8}
          xs={12}
        >
          <LatestSales store={store} />
        </Grid>

      </Grid>
    </div>
  );
};

export default Dashboard;
