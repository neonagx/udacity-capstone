import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createWoofer, deleteWoofer, getWoofers, patchWoofer } from '../api/woofers-api'
import Auth from '../auth/Auth'
import { Woofer } from '../types/Woofer'
import doggo from '../../src/asset/doggo.png';

interface WoofersProps {
  auth: Auth
  history: History
}

interface WoofersState {
  woofers: Woofer[]
  newWooferName: string
  loadingWoofers: boolean
}

export class Woofers extends React.PureComponent<WoofersProps, WoofersState> {
  state: WoofersState = {
    woofers: [],
    newWooferName: '',
    loadingWoofers: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newWooferName: event.target.value })
  }

  onEditButtonClick = (wooferId: string) => {
    this.props.history.push(`/woofers/${wooferId}/edit`)
  }

  onWooferCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newWoofer = await createWoofer(this.props.auth.getIdToken(), {
        name: this.state.newWooferName,
        dueDate
      })
      this.setState({
        woofers: [...this.state.woofers, newWoofer],
        newWooferName: ''
      })
    } catch {
      alert('Woofer creation failed')
    }
  }

  onWooferDelete = async (wooferId: string) => {
    try {
      await deleteWoofer(this.props.auth.getIdToken(), wooferId)
      this.setState({
        woofers: this.state.woofers.filter(woofer => woofer.wooferId !== wooferId)
      })
    } catch {
      alert('Woofer deletion failed')
    }
  }

  onWooferCheck = async (pos: number) => {
    try {
      const woofer = this.state.woofers[pos]
      await patchWoofer(this.props.auth.getIdToken(), woofer.wooferId, {
        name: woofer.name,
        dueDate: woofer.dueDate,
        done: !woofer.done
      })
      this.setState({
        woofers: update(this.state.woofers, {
          [pos]: { done: { $set: !woofer.done } }
        })
      })
    } catch {
      alert('Woofer deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const woofers = await getWoofers(this.props.auth.getIdToken())
      this.setState({
        woofers,
        loadingWoofers: false
      })
    } catch (e) {
      if(e instanceof Error) {
      alert(`Failed to fetch Woofers: ${e.message}`);
      }
    }
  }

  render() {
    return (
      <div>
        <img src={doggo}/>
        <Header as="h1">Welcome To Woofers</Header>

        {this.renderCreateWooferInput()}

        {this.renderWoofers()}
      </div>
    )
  }

  renderCreateWooferInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Woofer',
              onClick: this.onWooferCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the doggo world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderWoofers() {
    if (this.state.loadingWoofers) {
      return this.renderLoading()
    }

    return this.renderWoofersList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Woofers
        </Loader>
      </Grid.Row>
    )
  }

  renderWoofersList() {
    return (
      <Grid padded>
        {this.state.woofers.map((woofer, pos) => {
          return (
            <Grid.Row key={woofer.wooferId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onWooferCheck(pos)}
                  checked={woofer.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {woofer.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {woofer.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(woofer.wooferId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onWooferDelete(woofer.wooferId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {woofer.attachmentUrl && (
                <Image src={woofer.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
