/**
 * 通知页面
 */

import React, { Component } from 'react'
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Button } from 'native-base'
import { getNotifications, clearNotifications } from '../utils/api'
import Icon from 'react-native-vector-icons/FontAwesome5'
import TootBox from './common/TootBox'
import Header from './common/Header'
import Loading from './common/Loading'
import ListFooterComponent from './common/ListFooterComponent'
import { themeData } from '../utils/color'
import mobx from '../utils/mobx'
import Divider from './common/Divider'
import { Confirm } from './common/Notice'
import { observer } from 'mobx-react'

let color = {}
@observer
export default class Notifications extends Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      loading: true
    }
  }
  componentDidMount() {
    this.getNotifications()
  }

  deleteToot = id => {
    this.setState({
      list: this.state.list.filter(toot => toot.id !== id)
    })
  }

  // 清空列表中刚被mute的人的所有消息
  muteAccount = id => {
    this.setState({
      list: this.state.list.filter(toot => toot.account.id !== id)
    })
  }

  // 清空列表中刚被mute的人的所有消息
  blockAccount = id => {
    this.setState({
      list: this.state.list.filter(toot => toot.account.id !== id)
    })
  }

  /**
   * @description 获取时间线数据
   * @param {cb}: 成功后的回调函数
   * @param {params}: 分页参数
   */
  getNotifications = (cb, params) => {
    getNotifications(params).then(res => {
      // 同时将数据更新到state数据中，刷新视图
      this.setState({
        list: this.state.list.concat(res),
        loading: false
      })
      if (cb) cb()
    })
  }

  /**
   * @description 清空通知
   * @param {}:
   */
  clearNotifications = () => {
    Confirm.show('确定清空所有通知吗？', () => {
      clearNotifications().then(() => {
        this.setState({
          list: [],
          loading: false
        })
      })
    })
  }

  refreshHandler = () => {
    this.setState({
      loading: true,
      list: []
    })
    this.getNotifications()
  }

  // 滚动到了底部，加载数据
  onEndReached = () => {
    const state = this.state
    this.getNotifications(null, {
      max_id: state.list[state.list.length - 1].id
    })
  }

  render() {
    const state = this.state
    color = themeData[mobx.theme]

    if (state.loading) {
      return <Loading />
    }
    return (
      <View style={[styles.container, { backgroundColor: color.themeColor }]}>
        <Header
          left={
            <Button transparent>
              <Icon
                style={[styles.icon, { color: color.subColor }]}
                name="arrow-left"
                onPress={() => this.props.navigation.goBack()}
              />
            </Button>
          }
          title={'通知'}
          right={
            <Button transparent onPress={this.clearNotifications}>
              <Icon
                style={[styles.icon, { color: color.subColor }]}
                name="trash-alt"
              />
            </Button>
          }
        />
        <FlatList
          ItemSeparatorComponent={() => <Divider />}
          showsVerticalScrollIndicator={false}
          data={state.list}
          onEndReachedThreshold={0.1}
          onEndReached={this.onEndReached}
          onScroll={this.props.onScroll}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={state.loading}
              onRefresh={this.refreshHandler}
            />
          }
          ListFooterComponent={() => (
            <ListFooterComponent info={'你还没有收到任何通知'} />
          )}
          renderItem={({ item }) => (
            <TootBox
              data={item}
              navigation={this.props.navigation}
              deleteToot={this.deleteToot}
              muteAccount={this.muteAccount}
              blockAccount={this.blockAccount}
            />
          )}
        />
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
