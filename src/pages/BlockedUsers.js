/**
 * 私信页面
 */

import React, { Component } from 'react'
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Button } from 'native-base'
import { getBlocks, getRelationship } from '../utils/api'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Header from './common/Header'
import { themeData } from '../utils/color'
import mobx from '../utils/mobx'
import Divider from './common/Divider'
import Empty from './common/Empty'
import UserItem from './common/UserItem'
import { observer } from 'mobx-react'
import { UserSpruce } from './common/Spruce'

let color = {}
@observer
export default class MutedUsers extends Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      relationships: [],
      loading: true
    }
  }
  componentDidMount() {
    this.getBlocks()
  }

  /**
   * @description 删除嘟文
   * @param {id}: 嘟文id
   * @param {recycle}: 是否重新编辑嘟文
   */
  deleteToot = (id, recycle = false) => {
    const list = this.state.list
    this.setState({
      list: list.filter(toot => toot.id !== id)
    })
  }

  /**
   * @description 从关系数组中找到特定用户的数据
   * @param {id}: account.id
   */
  findOne = id => {
    const result = this.state.relationships.filter(item => item.id === id)[0]
    return result || {}
  }

  /**
   * @description 获取时间线数据
   * @param {cb}: 成功后的回调函数
   * @param {params}: 分页参数
   */
  getBlocks = (cb, params) => {
    getBlocks(mobx.domain, params)
      .then(res => {
        // 同时将数据更新到state数据中，刷新视图
        this.setState({
          list: this.state.list.concat(res),
          loading: false
        })
        if (cb) cb()
        this.getRelationship(this.state.list.map(item => item.id))
      })
      .catch(() => {
        this.setState({
          loading: false
        })
      })
  }

  getRelationship = ids => {
    getRelationship(mobx.domain, ids).then(res => {
      this.setState({
        relationships: res
      })
    })
  }

  refreshHandler = () => {
    this.setState({
      loading: true,
      list: []
    })
    this.getBlocks()
  }

  deleteUser = id => {
    this.setState({
      list: this.state.list.filter(item => item.id !== id)
    })
  }

  render() {
    const state = this.state
    color = themeData[mobx.theme]

    return (
      <View style={[styles.container, { backgroundColor: color.themeColor }]}>
        <Header
          left={
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon
                style={[styles.icon, { color: color.subColor }]}
                name={'arrow-left'}
              />
            </Button>
          }
          title={'已屏蔽用户'}
          right={'none'}
        />
        {state.loading ? (
          <UserSpruce />
        ) : (
          <FlatList
            ItemSeparatorComponent={() => <Divider />}
            ListFooterComponent={state.list.length ? <Divider /> : <View />}
            ListEmptyComponent={<Empty />}
            showsVerticalScrollIndicator={false}
            data={state.list}
            onScroll={this.props.onScroll}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl
                refreshing={state.loading}
                onRefresh={this.refreshHandler}
              />
            }
            renderItem={({ item }) => (
              <UserItem
                data={item}
                model={'block'}
                relationship={this.findOne(item.id)}
                navigation={this.props.navigation}
                deleteUser={this.deleteUser}
              />
            )}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0
  },
  icon: {
    fontSize: 17
  }
})
