import { JobStatus } from "../../gen/v1/domain_pb";

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
    }
};