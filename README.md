# Update Android manifest package action

This action injects and updates the `meta-data android:value` property for the `application/meta-data android:name` given of the AndroidManifest.xml file for your Android projects.

## Inputs

### `android-manifest-path`

**Required** The relative path for the AndroidManifest.xml file.

### `metadata-key` 
  
**Required** The key name for the metadata you wish to change `meta-data android:name`.

###  `metadata-value`
    
**Required** The new value you wish to enter `android:value`.

###  `print-file`

Output the AndroidManifest.xml file in console before and after update.

## Usage 1

```yaml
- name: Update AndroidManifest.xml
  uses: jacinlowe/update-android-manifest-package-action@v1.0.1
  with:
    android-manifest-path: './path_to_your/AndroidManifest.xml'
    metadata-key: 'com.google.android.geo.API_KEY'
    metadata-value: 'API_KEY_HERE'
    print-file: true
```

## Usage 2

```yaml
- name: Update AndroidManifest.xml
  uses: jacinlowe/update-android-manifest-package-action@v1.0.1
  with:
    android-manifest-path: './path_to_your/AndroidManifest.xml'
    metadata-key: 'com.google.android.geo.API_KEY'
    metadata-value: ${{secrets.YOUR_API_KEY_HERE}}
    print-file: true
```
