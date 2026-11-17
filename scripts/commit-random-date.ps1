$start = [DateTimeOffset]::new(1970, 1, 1, 0, 0, 0, [TimeSpan]::Zero).ToUnixTimeSeconds()
$endExclusive = [DateTimeOffset]::new(2033, 1, 1, 0, 0, 0, [TimeSpan]::Zero).ToUnixTimeSeconds()
$timestamp = Get-Random -Minimum $start -Maximum $endExclusive
$gitDate = "@$timestamp +0000"

$previousAuthorDate = [Environment]::GetEnvironmentVariable('GIT_AUTHOR_DATE', 'Process')
$previousCommitterDate = [Environment]::GetEnvironmentVariable('GIT_COMMITTER_DATE', 'Process')

try {
    $env:GIT_AUTHOR_DATE = $gitDate
    $env:GIT_COMMITTER_DATE = $gitDate
    & git commit @args
    $commitExitCode = $LASTEXITCODE
}
finally {
    [Environment]::SetEnvironmentVariable('GIT_AUTHOR_DATE', $previousAuthorDate, 'Process')
    [Environment]::SetEnvironmentVariable('GIT_COMMITTER_DATE', $previousCommitterDate, 'Process')
}

exit $commitExitCode
