import { JobStatus } from '../../gen/v1/domain_pb';

export const jobStatusText = (status: JobStatus) => {
	switch (status) {
		case JobStatus.UNSPECIFIED:
			return 'Unspecified';
		case JobStatus.ARRIVING:
			return 'Arriving';
		case JobStatus.WORKING:
			return 'Working';
		case JobStatus.RETURNING:
			return 'Returning';
		case JobStatus.FINISHED:
			return 'Finished';
		case JobStatus.WAITING_INPUT:
			return 'Waiting for input';
		case JobStatus.WAITING_OUTPUT:
			return 'Waiting for output space';
	}
};
