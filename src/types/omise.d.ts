export {}

declare global {
  interface Window {
    Omise: {
      setPublicKey: (key: string) => void
      createToken: (
        type: string,
        data: any,
        callback: (statusCode: number, response: any) => void
      ) => void
    }
  }
}
