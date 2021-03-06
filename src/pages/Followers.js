/**
 * 关注者页面
 */

import React, { Component } from 'react'
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Button } from 'native-base'
import { followers } from '../utils/api'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Header from './common/Header'
import { UserSpruce } from './common/Spruce'
import { themeData } from '../utils/color'
import mobx from '../utils/mobx'
import Divider from './common/Divider'
import UserItem from './common/UserItem'
import { observer } from 'mobx-react'

let color = {}
@observer
export default class Followers extends Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      loading: true
    }
  }
  componentDidMount() {
    const { navigation } = this.props
    const id = navigation.getParam('id')
    const limit = navigation.getParam('limit')
    this.followers(id, limit)
  }

  /**
   * @description 获取时间线数据
   * @param {id}: 用户id
   * @param {limit}: 获取数据数量
   */
  followers = (id, limit) => {
    followers(id, limit)
      .then(res => {
        // 同时将数据更新到state数据中，刷新视图
        this.setState({
          list: this.state.list.concat(res),
          loading: false
        })
      })
      .catch(() => {
        this.setState({
          loading: false
        })
      })
  }

  refreshHandler = () => {
    this.setState({
      loading: true,
      list: []
    })
    this.followers()
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
          title={'关注者'}
          right={'none'}
        />
        {state.loading ? (
          <UserSpruce />
        ) : (
          <FlatList
            ItemSeparatorComponent={() => <Divider />}
            ListFooterComponent={<Divider />}
            showsVerticalScrollIndicator={false}
            data={state.list}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl
                refreshing={state.loading}
                onRefresh={this.refreshHandler}
              />
            }
            renderItem={({ item }) => (
              <UserItem data={item} navigation={this.props.navigation} />
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
