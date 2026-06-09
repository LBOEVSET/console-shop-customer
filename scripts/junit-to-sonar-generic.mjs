#!/usr/bin/env node
/**
 * Converts a Vitest JUnit XML report to SonarQube Generic Test Execution format.
 * Usage: node scripts/junit-to-sonar-generic.mjs test-results.xml sonar-test-results.xml
 */
import { readFileSync, writeFileSync } from 'fs'

const inputFile  = process.argv[2] || 'test-results.xml'
const outputFile = process.argv[3] || 'sonar-test-results.xml'

const input = readFileSync(inputFile, 'utf8')

// Parse <testcase> elements
const testCaseRegex = /<testcase\s([^>]*)>([\s\S]*?)<\/testcase>|<testcase\s([^/]*?)\/>/g
const attrRegex     = /(\w+)="([^"]*)"/g

function parseAttrs(str) {
  const attrs = {}
  let m
  while ((m = attrRegex.exec(str)) !== null) {
    attrs[m[1]] = m[2]
  }
  return attrs
}

const files = {}

let match
while ((match = testCaseRegex.exec(input)) !== null) {
  const attrStr  = match[1] || match[3]
  const inner    = match[2] || ''
  const attrs    = parseAttrs(attrStr)

  const name      = attrs.name     || 'unknown'
  const classname = attrs.classname || 'unknown'
  const duration  = Math.round(parseFloat(attrs.time || '0') * 1000)

  // Derive a synthetic file path from classname
  const filePath = classname.replace(/\./g, '/') + '.tsx'

  const hasFailure = inner.includes('<failure')
  const hasSkipped = inner.includes('<skipped')

  let status
  if (hasFailure)     status = 'FAILED'
  else if (hasSkipped) status = 'SKIPPED'
  else                status = 'OK'

  let failureMsg = ''
  if (hasFailure) {
    const fMatch = inner.match(/<failure[^>]*>([\s\S]*?)<\/failure>/)
    failureMsg = fMatch ? fMatch[1].trim().substring(0, 500) : 'Test failed'
  }

  if (!files[filePath]) files[filePath] = []
  files[filePath].push({ name, duration, status, failureMsg })
}

// Build output XML
const lines = ['<testExecutions version="1">']

for (const [filePath, tests] of Object.entries(files)) {
  lines.push(`  <file path="${filePath}">`)
  for (const t of tests) {
    if (t.status === 'FAILED') {
      lines.push(`    <testCase name="${escapeXml(t.name)}" duration="${t.duration}">`)
      lines.push(`      <failure message="${escapeXml(t.failureMsg.substring(0, 200))}"/>`)
      lines.push(`    </testCase>`)
    } else if (t.status === 'SKIPPED') {
      lines.push(`    <testCase name="${escapeXml(t.name)}" duration="${t.duration}">`)
      lines.push(`      <skipped message="skipped"/>`)
      lines.push(`    </testCase>`)
    } else {
      lines.push(`    <testCase name="${escapeXml(t.name)}" duration="${t.duration}"/>`)
    }
  }
  lines.push(`  </file>`)
}

lines.push('</testExecutions>')

writeFileSync(outputFile, lines.join('\n'), 'utf8')
console.log(`✓ Converted ${inputFile} → ${outputFile}`)

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
