import React from 'react'
import { List, Avatar, Button, Skeleton, Tag } from 'antd'
import { MainMenu } from '../MainMenu/MainMenu'
import Store, { StoreProps } from '../store/AppStore'
import TimeAgo from 'timeago-react'
import { chromeId } from '../config'
import { Link, RouteComponentProps } from 'react-router-dom'

const count = 10

type FromRoute = RouteComponentProps<{
  tag: string
  user: string
}>

class FeedUnwrapped extends React.Component {
  props: StoreProps & FromRoute

  state = {
    offset: 0,
    initLoading: true,
    loading: false,
    hasMore: false,
    data: [],
    list: []
  }

  componentDidMount() {
    this.getData(this.state.offset, res => {
      this.setState({
        initLoading: false,
        hasMore: !!res.next,
        offset: res.links.length,
        data: res.links,
        list: res.links
      })
      if (
        !this.getTag() &&
        !this.getUser() &&
        res.links &&
        res.links.length &&
        window['chrome'] &&
        window['chrome'].runtime
      ) {
        window['chrome'].runtime.sendMessage(chromeId, {
          type: 'lastLink',
          url: res.links[0].url,
          username: res.links[0].username
        })
      }
    })
  }

  getRateSection(rating) {
    if (rating < 30) {
      return {
        rating: 1
      }
    }
    if (rating >= 30 && rating < 50) {
      return {
        rating: 2
      }
    }
    if (rating >= 50 && rating < 70) {
      return {
        rating: 3
      }
    }
    if (rating >= 70 && rating < 90) {
      return {
        rating: 4
      }
    }
    if (rating >= 90 && rating <= 100) {
      return {
        rating: 5
      }
    }
  }

  getTag() {
    return this.props.match &&
      this.props.match.params &&
      this.props.match.params.tag
      ? this.props.match.params.tag
      : ''
  }

  getUser() {
    return this.props.match &&
      this.props.match.params &&
      this.props.match.params.user
      ? this.props.match.params.user
      : ''
  }

  getData = (offset, callback) => {
    const tag = this.getTag()
    const user = this.getUser()
    fetch(
      `https://api.beenion.com/v1/feed?offset=${offset}&user=${user}&tag=${tag}`,
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.props.store.get('token')}`
        }
      }
    )
      .then(response => response.json())
      .then(res => {
        callback(res)
      })
  }

  onLoadMore = () => {
    this.setState({
      loading: true,
      list: this.state.data.concat(
        [...new Array(count)].map(() => ({ loading: true, name: {} }))
      )
    })
    this.getData(this.state.offset, res => {
      const data = this.state.data.concat(res.links)
      this.setState(
        {
          data,
          list: data,
          hasMore: !!res.next,
          offset: this.state.offset + res.links.length,
          loading: false
        },
        () => {
          // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
          // In real scene, you can using public method of react-virtualized:
          // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
          window.dispatchEvent(new Event('resize'))
        }
      )
    })
  }

  render() {
    const { initLoading, loading, list, hasMore } = this.state
    const loadMore =
      hasMore && !initLoading && !loading ? (
        <div
          style={{
            textAlign: 'center',
            marginTop: 12,
            height: 32,
            lineHeight: '32px'
          }}
        >
          <Button onClick={this.onLoadMore.bind(this)}>load more</Button>
        </div>
      ) : null

    return (
      <div>
        <MainMenu route="feed" />
        <List
          className="demo-loadmore-list"
          loading={initLoading}
          itemLayout="horizontal"
          loadMore={loadMore}
          dataSource={list}
          locale={{
            emptyText: (
              <div>
                {this.getTag()
                  ? 'No links found. Make sure to '
                  : 'Your feed is empty. Make sure to '}
                <b>
                  <a href="/follow">follow</a>
                </b>{' '}
                people you trust.
              </div>
            )
          }}
          renderItem={item => {
            return (
              <List.Item>
                <Skeleton avatar title={false} loading={item.loading} active>
                  <List.Item.Meta
                    avatar={
                      item.rating && (
                        <Avatar
                          className={
                            'color-rate-' +
                            this.getRateSection(item.rating).rating
                          }
                          style={{ marginTop: 10 }}
                        >
                          {item.rating}
                        </Avatar>
                      )
                    }
                    title={
                      <div>
                        <div>
                          <Link
                            style={{ color: '#000000a6' }}
                            to={'/user/' + item.username}
                          >
                            {item.username}
                          </Link>
                          <span
                            style={{
                              color: '#a2a2a2',
                              fontSize: 11,
                              marginLeft: 5
                            }}
                          >
                            ({item.time && <TimeAgo datetime={item.time} />})
                          </span>
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.image && (
                            <img
                              alt=""
                              style={{ marginRight: 5 }}
                              src={item.image}
                              width="16"
                            />
                          )}
                          <span>
                            <span style={{ color: '#666' }}>{item.title}</span>
                            <div className="feedurl">{item.url}</div>
                          </span>
                        </a>
                      </div>
                    }
                    description={
                      <div>
                        {item.tags &&
                          item.tags.map(tag => (
                            <Tag key={tag} color="blue">
                              <Link to={'/tag/' + tag}>{tag}</Link>
                            </Tag>
                          ))}
                      </div>
                    }
                  />
                </Skeleton>
              </List.Item>
            )
          }}
        />
      </div>
    )
  }
}

export const Feed = Store.withStore(FeedUnwrapped)
