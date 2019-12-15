/* eslint-disable react/self-closing-comp */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import SvgIcon from '@material-ui/core/SvgIcon';
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Collapse from '@material-ui/core/Collapse';
import config from 'config'
import {
  Card
} from '@material-ui/core';
import { useSpring, animated } from 'react-spring/web.cjs'; // web.cjs is required for IE 11 support
import store from 'store';
function MinusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
}

function PlusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  );
}

function CloseSquare(props) {
  return (
    <SvgIcon className="close" fontSize="inherit" {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  );
}

function TransitionComponent(props) {
  const style = useSpring({
    from: { opacity: 0, transform: 'translate3d(20px,0,0)' },
    to: { opacity: props.in ? 1 : 0, transform: `translate3d(${props.in ? 0 : 20}px,0,0)` },
  });

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  );
}

TransitionComponent.propTypes = {
  /**
   * Show the component; triggers the enter or exit states
   */
  in: PropTypes.bool,
};

const StyledTreeItem = withStyles(theme => ({
  iconContainer: {
    '& .close': {
      opacity: 0.3,
    },
  },
  group: {
    marginLeft: 5,
    paddingLeft: 10,
    borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
  },
}))(props => <TreeItem {...props} TransitionComponent={TransitionComponent} />);

const useStyles = makeStyles({
  root: {
    height: '100%',
    flexGrow: 1,
    maxWidth: 400,
  },
});
function handle_treeclick(tree) {
  console.log('进入文件夹：', tree);
  store.dispatch({ type: 'intree', tree: tree })


}
function Tree_view(tree, id) {
  //console.log(tree)
  if ('content' in tree) {
    if (tree.content.length === 0) {//空文件夹
      return (<StyledTreeItem
        key={(id++).toString()}
        label={tree.path.slice(tree.path.lastIndexOf('/') + 1)}
        nodeId={tree.path}
        onClick={() => handle_treeclick(tree)}>
      </ StyledTreeItem>)
    }
    else {//非空文件夹
      let tree_arr = []
      for (var pos in tree.content) {
        if ('content' in tree.content[pos] || config.show_file_in_tree)
          tree_arr.push(Tree_view(tree.content[pos], id++))
      }
      return (<StyledTreeItem
        key={(id++).toString()}
        label={tree.path.slice(tree.path.lastIndexOf('/') + 1)}
        nodeId={tree.path}
        onClick={() => handle_treeclick(tree)}
      >{tree_arr}</StyledTreeItem>)

    }
  }
  else if (config.show_file_in_tree) {//文件
    return (<StyledTreeItem
      key={(id++).toString()}
      nodeId={tree.path}
      label={tree.path.slice(tree.path.lastIndexOf('/') + 1)} />)
  }

}
export default function TreeContent() {
  const classes = useStyles();
  let tree = store.getState().tree
  return (
    <div style={{ height: '100%' }}>
      <Card style={{ height: '100%' }}>
        <TreeView style={{ marginLeft: 5, marginTop: 5 }}
          className={classes.root}
          defaultExpanded={[store.getState().username]}
          defaultCollapseIcon={<MinusSquare />}
          defaultExpandIcon={<PlusSquare />}
          defaultEndIcon={<CloseSquare />}
        >
          {Tree_view(tree, 0)}
        </TreeView >
      </Card>
    </div>
  );
}
