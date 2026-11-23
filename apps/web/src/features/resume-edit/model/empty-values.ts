export function emptyExperience() {
  return {
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  };
}

export function emptyEducation() {
  return {
    institution: '',
    degree: '',
    fieldOfStudy: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
  };
}

export function emptyProject() {
  return { name: '', role: '', description: '', url: '', startDate: '', endDate: '' };
}

export function emptyCertificate() {
  return { name: '', issuer: '', issuedAt: '', expiresAt: '', credentialUrl: '' };
}
