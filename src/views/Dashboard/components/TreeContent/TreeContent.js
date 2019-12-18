/* eslint-disable react/self-closing-comp */
/* eslint-disable react/no-multi-comp */

import React from 'react';
import PropTypes from 'prop-types';
import { Tree } from 'antd';
import 'index.css'
import config from 'config'
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import FolderOpenOutlinedIcon from '@material-ui/icons/FolderOpenOutlined';
import FolderOutlinedIcon from '@material-ui/icons/FolderOutlined';
import { connect } from 'react-redux'
import {
  Card
} from '@material-ui/core';
import store from 'store';
const { TreeNode, DirectoryTree } = Tree;

function handle_treeclick(tree) {
  var Console = console
  Console.log('通过点击进入文件夹：', tree);
  store.dispatch({ type: 'intree', tree: tree })
}
function Tree_view(tree, id) {
  //console.log(tree)

  if ('content' in tree) {
    if (tree.content.length === 0) {//空文件夹
      return (
        <TreeNode
          title={tree.path.slice(tree.path.lastIndexOf('/') + 1)}
          key={tree.path}
          tree={tree}
          isLeaf
          icon={<FolderOutlinedIcon />}
          onSelect={() => handle_treeclick(tree)} />)
    }
    else {//非空文件夹
      let tree_arr = []
      for (var pos in tree.content) {
        if ('content' in tree.content[pos] || config.show_file_in_tree)
          tree_arr.push(Tree_view(tree.content[pos], id++))
      }
      return (<TreeNode title={tree.path.slice(tree.path.lastIndexOf('/') + 1)}
        key={tree.path}
        icon={props => { return props.expanded ? <FolderOpenOutlinedIcon /> : <FolderOutlinedIcon /> }}
        tree={tree}
        onSelect={() => handle_treeclick(tree)} >{tree_arr}</TreeNode>)
    }
  }
  else if (config.show_file_in_tree) {//文件
    return (<TreeNode title={tree.path.slice(tree.path.lastIndexOf('/') + 1)}
      key={tree.path}
      icon={<InsertDriveFileOutlinedIcon />}
      isLeaf
      tree={tree}
      onClick={() => handle_treeclick(tree)} />)
  }

}
const mapStateToProps = (store) => {
  return {
    prop4store: store
  }
}
const onSelect = (keys, event) => {
  handle_treeclick(event.node.props.tree)
};

function TreeContent(props) {
  const { prop4store } = props;
  //let tree = store.getState().tree
  return (
    <Card style={{height:'100%'}}>
      <DirectoryTree
        defaultExpandedKeys={[prop4store.init_tree.path]}
        expandAction="doubleClick"
        onSelect={onSelect}
        //expandedKeys={}
        //selectedKeys={[prop4store.tree.path]}
      >
        {Tree_view(prop4store.init_tree, 0)}
      </DirectoryTree>
    </Card>
  );
}
export default connect(mapStateToProps)(TreeContent)
TreeContent.propTypes = {
  prop4store: PropTypes.object
};
