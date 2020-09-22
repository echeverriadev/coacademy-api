const fs = require('fs');
const path = require('path');
const Transbank = require('transbank-sdk');

var Transaction = function () {

    const configuration = new Transbank.Configuration()
                        .withCommerceCode('597035841148')
                        .withPrivateCert(`-----BEGIN RSA PRIVATE KEY-----
                        MIIEowIBAAKCAQEAo+urBh+ZuCXr+b+O5rVTENmIN3g4bnSVjzNTxUnfRafZHrAG
                        bWGzIYXAUdwrCL9IlMlaCYolbaoXSG9aA1iIZ8tmBxOWTZ430Wwo/qjZInTlWoMD
                        1YSZ4fID5ANQB5vcN8P3CI/886RNCX65mXqjQcl4/xYqKfqNnZcOZoG99mFlsHU3
                        pwr50kapMKJkQy3kw3sXEn/bWi8Imexc7UpUUeCTKbucFyXhNKoZDRrmUQsGUrOd
                        5nE2g3/JsPDqmJAK6BqYdO837UlgMueKVcBih1YQp/Y7kyGro+XKDlyPa20sg19r
                        29cHMe/zn6vpVOEs8fqjaqzFeNZOanTohRwhvwIDAQABAoIBAQCZo1/PA3tewBxn
                        H4Ze8wECQAGOjB3IWXl8mM0hk1WzwdidDLtZdkMhXm2dzFCBiFgNLJQ5cMQX/16H
                        Q+cIT8i6EEh2xYMRCQSkQ05BMh0iUJJPvZCwZfKdderzoa83Enzbv88gtWSPMCYM
                        ijyHgAzYsm+4Fxw58F8fn9+dcGmOLMdW8MWXDvwLpa8eYfE4VUICGcSmW0JeKvHr
                        0TR805++Kk1OFAH29A3frKe9bsFnitx21UvvOHpvzgP8fS8f1dwQe8/O8UO8ZHd9
                        CtuLRr8ViMwNd8leiHxZmxO4Q4f0ImZD8f/l84fLDRHhakuRe8beUmJ8eA68tZc1
                        I6NuhmDhAoGBANdq764bzmCCQbQCoLRWZ9ewn9pdgHd+SIRcFLnahbt2dYtR6xUG
                        gT0U4lzJ+/9cp+51ci/SDJlj8Re0xVfug/IDOuifA3PFvq3jh7Pb34H2uQ/9nc5R
                        xbBqM8i9dssprMl01PNv7YLcZLENjaDwFVhyPdTClAcWKsczZtybsKinAoGBAMLN
                        Ju4gN+BkjvpH1UMXMq7Ho+NYL2gFSanuKUEb8/J6eIcP5ZlQrsGy3I0IziwE5egF
                        dRjO3fwJDwigr6eU2L6J50/4Dr8SRxtLWvezI+hbb1xPaKCB3+Y+xhzO8A0ofol0
                        rgMx7STRfDxvHA2dVjoQOTtz7riDpJGQeuTaKskpAoGAaYmum3JsDcRDRFn1OeUL
                        QxT5fBZLFj/8bzxduyBgXJOQywz7S3XAY5iTvjoHB/jxHVbU9rDGE3BvcdnSxV3J
                        rwv+FHGzU0kSPkc2+NtECXxC9p6ebbKKU//0FukcBjUIvjpLCmlPx8kKW+Pz+2Ek
                        VAzEVjRuKXqmwqlgP7zXNAkCgYAPdyAXGaG2A+XCAv/wYqAYdisRuoeQ95KAljLa
                        Q3DbmFOHTYDJ6jjlkeCmpcNQhVcHU5+XR50iDEoQQkmPwWZvwh0GIUhybO4OQa5I
                        KgW4xcGSj49b5tOywNsToG44bTWWjhfekxEjsint1lhg0FPvKiiRCsQyC+l90P2g
                        u51X+QKBgH1OnXJ4TodnuvobswEF+aJxJwj4rLZpy+WkJduTeDK2lr2iRsMBKUwL
                        zC7jD5SEW41zB+3j+1vDfvbwPrtmf2Z8evQFIZOE+mkv8OX0JCTVIhCMpluoQ1qr
                        wkmgQpPT8Hn0D5IIIFstsZSkJOe+GXp8fgIg4Q2CXcAIPkGL3cOr
                        -----END RSA PRIVATE KEY-----`)
                        .withPublicCert(`-----BEGIN CERTIFICATE-----
                        MIIDPzCCAicCFE102+/M1oSAllUJPEcwUKmdW3tvMA0GCSqGSIb3DQEBCwUAMFwx
                        CzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRl
                        cm5ldCBXaWRnaXRzIFB0eSBMdGQxFTATBgNVBAMMDDU5NzAzNTg0MTE0ODAeFw0y
                        MDA5MjIyMzI4NDlaFw0yNDA5MjEyMzI4NDlaMFwxCzAJBgNVBAYTAkFVMRMwEQYD
                        VQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBM
                        dGQxFTATBgNVBAMMDDU5NzAzNTg0MTE0ODCCASIwDQYJKoZIhvcNAQEBBQADggEP
                        ADCCAQoCggEBAKPrqwYfmbgl6/m/jua1UxDZiDd4OG50lY8zU8VJ30Wn2R6wBm1h
                        syGFwFHcKwi/SJTJWgmKJW2qF0hvWgNYiGfLZgcTlk2eN9FsKP6o2SJ05VqDA9WE
                        meHyA+QDUAeb3DfD9wiP/POkTQl+uZl6o0HJeP8WKin6jZ2XDmaBvfZhZbB1N6cK
                        +dJGqTCiZEMt5MN7FxJ/21ovCJnsXO1KVFHgkym7nBcl4TSqGQ0a5lELBlKzneZx
                        NoN/ybDw6piQCugamHTvN+1JYDLnilXAYodWEKf2O5Mhq6Plyg5cj2ttLINfa9vX
                        BzHv85+r6VThLPH6o2qsxXjWTmp06IUcIb8CAwEAATANBgkqhkiG9w0BAQsFAAOC
                        AQEACI+N5HHJJROjnBXhQH1YLKEQAdZGCWSSaM0n/pFGEHVqrPkRbQ4rB68o3Lo1
                        6h79ZHtJ/ynhJpw6z/nxrGe8p7UhuwVE+iowH39vRXp4MxL3ajVOs3arXbRQHVS9
                        UKhsdEvaK4ydRPYYIgm9SYtCpCYHD1ErbjOQCQxeGoAhOo0vCdXBdMMO/GpfNnfF
                        uW3RjxzX97snUG7SPqwin4I3ylKs39Z08/7n/fpcChI32cl3tdWHzhK0EUtDoqqP
                        hWdKQhNjhmwU9hUaL+2Q3DqOLXT+UePdpdQ3fA/y/R6Wy+XCr8MFJM1uz0p2tlbD
                        ZzXNr1GUNPIyI4ZPyM4wLUll9Q==
                        -----END CERTIFICATE-----`)
                        .usingEnvironment(Transbank.environments.production) 
    const transaction = new Transbank.Webpay(configuration).getNormalTransaction();
    return transaction;
}

module.exports = Transaction;