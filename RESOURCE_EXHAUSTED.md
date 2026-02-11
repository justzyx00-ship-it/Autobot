# Cursor `resource_exhausted` Recovery Guide

This error is a provider capacity issue, not a local code bug.

## Error pattern

You may see:

1. `ERROR_CUSTOM_MESSAGE`
2. `High Load`
3. `[resource_exhausted] Error`
4. `isRetryable: true`

## Fast recovery steps

1. Switch model to `Auto` in Cursor.
2. If available, pick a different model with lower load.
3. Start a fresh chat and resend only the minimal prompt.
4. Wait 30 to 90 seconds and retry.
5. If your plan allows it, upgrade plan capacity.

## Reduce repeat failures

1. Keep prompts smaller.
2. Send one focused task per message.
3. Avoid very large context unless required.
4. Split big work into several short requests.
5. Retry with exponential backoff:
   1. Retry 1 after 4 seconds.
   2. Retry 2 after 8 seconds.
   3. Retry 3 after 16 seconds.
   4. Retry 4 after 32 seconds.

## When to escalate

Escalate to support if all are true:

1. You retried after backoff.
2. You switched model.
3. You still get `resource_exhausted` for more than 15 minutes.

Include in the report:

1. Request ID.
2. Timestamp with timezone.
3. Model selected.
4. Full error payload.

