# Versioning Strategy

This project follows semantic versioning (semver) best practices.

## Semantic Versioning

Version format: **MAJOR.MINOR.PATCH** (e.g., 1.2.3)

- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible new features
- **PATCH**: Backwards-compatible bug fixes

## Release Process

### Creating a Release

1. **Update version** (if needed in code/configuration)

2. **Create and push a git tag:**
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

3. **Automated CI/CD** will:
   - Run all tests
   - Build JAR with Maven
   - Create container image with Cloud Native Buildpacks
   - Tag image with multiple versions
   - Push to GitHub Container Registry

### Image Tags Generated

When you push tag `v1.2.3`, the following image tags are created:

```
ghcr.io/kamloicc/potw:1.2.3      # Exact version
ghcr.io/kamloicc/potw:v1.2.3     # Exact version with v prefix
ghcr.io/kamloicc/potw:v1.2        # Major.Minor (rolling)
ghcr.io/kamloicc/potw:v1          # Major only (rolling)
ghcr.io/kamloicc/potw:latest     # Latest release
```

### Tag Usage Guidelines

- **v1.2.3** or **1.2.3**: Pin to specific version (production critical)
- **v1.2**: Get latest patch releases (recommended for most deployments)
- **v1**: Get latest minor and patch releases (early adopters)
- **latest**: Always get newest release (development/testing only)

### Non-Release Builds

Commits to `main` branch without tags:
```
ghcr.io/kamloicc/potw:<commit-sha>  # Specific commit
ghcr.io/kamloicc/potw:latest        # Latest main branch
```

## Examples

### Bug Fix Release (Patch)

Current: v1.2.3 → New: v1.2.4

```bash
# Fix the bug
git commit -m "fix: resolve issue with video upload"

# Create tag
git tag v1.2.4
git push origin v1.2.4
```

**Impact:**
- Users on `v1.2` automatically get the fix
- Users on `v1.2.3` need to update to `v1.2.4` or `v1.2`

### New Feature (Minor)

Current: v1.2.4 → New: v1.3.0

```bash
# Add feature
git commit -m "feat: add player search functionality"

# Create tag
git tag v1.3.0
git push origin v1.3.0
```

**Impact:**
- Users on `v1` automatically get the feature
- Users on `v1.2` need to update to `v1.3` or `v1`

### Breaking Change (Major)

Current: v1.3.0 → New: v2.0.0

```bash
# Make breaking change
git commit -m "feat!: change API response format"

# Create tag
git tag v2.0.0
git push origin v2.0.0
```

**Impact:**
- Creates new major version
- Users must explicitly upgrade to v2
- v1 images remain available

## Kubernetes Deployment Strategy

### Production (Stable)
```yaml
image: ghcr.io/kamloicc/potw:v1.2  # Pin to minor version
```

### Staging (Test new features)
```yaml
image: ghcr.io/kamloicc/potw:v1    # Auto-update minor versions
```

### Development
```yaml
image: ghcr.io/kamloicc/potw:latest  # Always newest
```

## Best Practices

1. **Always test** before tagging a release
2. **Use descriptive commit messages** (conventional commits)
3. **Pin versions in production** (use major.minor at minimum)
4. **Document breaking changes** in release notes
5. **Follow semantic versioning strictly**
6. **Keep changelog updated**

## Rollback

If a release has issues:

```bash
# Revert to previous version in Kubernetes
kubectl set image deployment/backend backend=ghcr.io/kamloicc/potw:v1.2.3

# Or rollback deployment
kubectl rollout undo deployment/backend
```

## Version History

Track releases in GitHub Releases page:
https://github.com/kamloicc/potw/releases
