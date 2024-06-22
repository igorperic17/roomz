import axios from 'axios';

class ThetaStream {
  private serviceAccountId: string;
  private serviceAccountSecret: string;

  constructor() {
    this.serviceAccountId = process.env.NEXT_PUBLIC_THETA_API_SERVICE_ACCOUNT_ID!;
    this.serviceAccountSecret = process.env.NEXT_PUBLIC_THETA_API_SERVICE_ACCOUNT_SECRET!;
  }

  async createStream(name: string) {
    const response = await axios.post('https://api.thetavideoapi.com/stream', {
      name
    }, {
      headers: {
        'x-tva-sa-id': this.serviceAccountId,
        'x-tva-sa-secret': this.serviceAccountSecret,
        'Content-Type': 'application/json'
      }
    });
    return response.data.body.id;
  }

  async listStreams() {
    const response = await axios.get(`https://api.thetavideoapi.com/service_account/${this.serviceAccountId}/streams`, {
      headers: {
        'x-tva-sa-id': this.serviceAccountId,
        'x-tva-sa-secret': this.serviceAccountSecret
      }
    });
    return response.data.body.streams;
  }

  async deleteStream(streamId: string) {
    try {
      await axios.delete(`https://api.thetavideoapi.com/stream/${streamId}`, {
        headers: {
          'x-tva-sa-id': this.serviceAccountId,
          'x-tva-sa-secret': this.serviceAccountSecret
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(`Stream ${streamId} not found, skipping deletion.`);
      } else {
        console.error(`Error deleting stream ${streamId}:`, error);
      }
    }
  }

  async unselectEdgeIngestor(ingestorId: string) {
    try {
      await axios.put(`https://api.thetavideoapi.com/ingestor/${ingestorId}/unselect`, {}, {
        headers: {
          'x-tva-sa-id': this.serviceAccountId,
          'x-tva-sa-secret': this.serviceAccountSecret,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error(`Error unselecting edge ingestor ${ingestorId}:`, error);
    }
  }

  async listEdgeIngestors() {
    const response = await axios.get('https://api.thetavideoapi.com/ingestor/filter', {
      headers: {
        'x-tva-sa-id': this.serviceAccountId,
        'x-tva-sa-secret': this.serviceAccountSecret
      }
    });
    return response.data.body.ingestors;
  }

  async selectEdgeIngestor(ingestorId: string, streamId: string) {
    const response = await axios.put(`https://api.thetavideoapi.com/ingestor/${ingestorId}/select`, {
      tva_stream: streamId
    }, {
      headers: {
        'x-tva-sa-id': this.serviceAccountId,
        'x-tva-sa-secret': this.serviceAccountSecret,
        'Content-Type': 'application/json'
      }
    });
    return {
      streamServer: response.data.body.stream_server,
      streamKey: response.data.body.stream_key
    };
  }

  async initialize() {
    const streams = await this.listStreams();
    for (const stream of streams) {
      if (stream.stream_server && stream.stream_key) {
        const ingestors = await this.listEdgeIngestors();
        for (const ingestor of ingestors) {
          if (ingestor.state === 'unavailable') {
            await this.unselectEdgeIngestor(ingestor.id);
          }
        }
      }
      await this.deleteStream(stream.id);
    }
  }
}

export default ThetaStream;
