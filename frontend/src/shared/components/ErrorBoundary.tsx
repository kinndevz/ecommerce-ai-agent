import { Component, type ReactNode } from 'react'
import InternalErrorPage from '@/shared/pages/InternalErrorPage'

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <InternalErrorPage />
    }
    return this.props.children
  }
}
