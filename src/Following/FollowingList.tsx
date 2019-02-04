import React from 'react'
import { List, Button } from 'antd'
import { MainMenu } from '../MainMenu/MainMenu'
import Store, { StoreProps } from '../store/AppStore'

class FollowingListUnwrapped extends React.Component {
  props: StoreProps

  state = {
    offset: 0,
    initLoading: true,
    users: []
  }

  componentDidMount() {
    this.getData(this.state.offset, res => {
      this.setState({
        initLoading: false,
        users: res
      })
    })
  }

  getData = (offset, callback) => {
    fetch('https://api.beenion.com/v1/listUsers', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.props.store.get('token')}`
      }
    })
      .then(response => response.json())
      .then(res => {
        callback(res)
      })
  }

  onFollow(username) {
    this.props.store.set('lastCommand')({
      type: 'follow',
      payload: {
        username
      }
    })
  }

  onUnfollow(username) {
    this.props.store.set('lastCommand')({
      type: 'unfollow',
      payload: {
        username
      }
    })
  }

  render() {
    const { initLoading, users } = this.state

    return (
      <div>
        <MainMenu route="follow" />
        <List
          className="demo-loadmore-list"
          loading={initLoading}
          itemLayout="horizontal"
          dataSource={users}
          renderItem={item => (
            <List.Item
              actions={[
                this.props.store.get('following').includes(item) ? (
                  <Button onClick={() => this.onUnfollow(item)} type="primary">
                    Following
                  </Button>
                ) : (
                  <Button onClick={() => this.onFollow(item)}>Follow</Button>
                )
              ]}
            >
              <List.Item.Meta title={item} />
            </List.Item>
          )}
        />
      </div>
    )
  }
}

export const FollowingList = Store.withStore(FollowingListUnwrapped)
