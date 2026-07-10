<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const API = import.meta.env.VITE_API_URL

// 🔥 TIPO
interface Pedido {
  id: string
  nome: string
  cor: string
  tamanho: string
  preco: number
  status: string
  imagem?: string
}

// 🔥 MOCK (para apresentação)
const pedidosMock: Pedido[] = [
  {
    id: '#111115',
    nome: 'Blusa regata alfaiataria',
    cor: 'bege',
    tamanho: 'M',
    preco: 85,
    status: 'entregue',
    imagem: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSMB1qH40YH3MUYSak37UyseaZiL08Gv8PCFyMcdXmDqNoPcTCzSJkdzE5042u4TQxo_okLJK1yyc5B0-scxBvjJ97R12grA9l0-8j8GToP0yWvuPFz5_Tt&usqp=CAc',
  },
  {
    id: '#111114',
    nome: 'Jeans semi-novo',
    cor: 'claro',
    tamanho: 'M',
    preco: 110,
    status: 'cancelado',
    imagem: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFhUXFxoYGRgXGBcYGhsYHRoaGxgZGBsaHSggGhslHxsZITEiJSkrLi4uGh8zODMsNygtLisBCgoKDg0OGxAQGi0lHyUtLS0tLS0tLS0tLS0tLS0vLS0tLS0tLS0tLS0tLy4tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAAEBQIDBgABB//EAEQQAAECAwQIBAQEBQMCBgMAAAECEQADIQQSMUEFIlFhcYGRoTKxwfAGE9HhI0Jy8VJigrLCFDPSkqJjc7PD4vIHNEP/xAAaAQACAwEBAAAAAAAAAAAAAAACBgEDBQAE/8QAMREAAgECBQIEBQQCAwAAAAAAAAECAxEEBRIhMVFhQXGBsRMikcHwIzJC8dHhMzSh/9oADAMBAAIRAxEAPwBtMe+231AHrHixTGPbQnXD7z5GPZoYbwx86QnRGpnSwKHf+3pE5OA/T31mipGXfqP3i2UnBzkX7/SDRDPVGp4Cnvj5xZbR4d7DufWKVBlF9g54/SLrcnDcE+f7d4NcgMV2mY5ubEgHZrqdjtBCIRacsySEqTTEULFnoRwwhjbLQQ6gfzbw4SAAWetb44NFfzSGKheSCCRgQC3hPeG/D09FJRfQVcRU11XLuZI2JQW6kKUMfmSnTMGxwmis6M8aHRASpF5Kps00qF3TR2SRU5qyzyhoZSKrQHBHhdjR8HFTA1olOU3Es+bVri+3KLbRRVdsgVkCiAkMz3nNMqioq7PnAGltHvrhSgSGLuARTHbjDW3EAAKCSXxdnwc574HEkEEArBYYVGOFIm64Is+RFYdHgTCnFJQb7il0BRp7zi7THwvKmS5E+ZMEsLkS/wAwS5uAjWLgY7hB2jA9quKWoiYDLN4beIoY08vRiDIs6VEJKJQSo/MUllIuoFQG/LmGwcQMUnLcltpbGIk/CpTLnLCyUpHh1DiTVwSxfZvxyusSSppSQkatwrUpJYZliRX6iNVNtUuUuZeBOobwe8U+G8KgXxrHFhhjjGW0nZ5K1j/SqFGJuuzliClSiS0W3srIB3b3GEj4KYXnMw40xAOYIO07SzQm0v8ADhS5C33EktlnWNRo4/KZlqWtq3iyXzxO+G0iSuePxJYYuHBFeZAiuSVgoya8j5WgFBwc4ElzTmcPpDJUl0pU7qo77OOyNdpfQ1nkJvrSSf4RQwksFkM1S5hDDBI2ZM+cDFeATd9x18KS/loY4KLh2/qbbUJPONQZgxFQ2O4tGXJUhGp40FK6i8SkVYHLOtIcaEtN+WdqVKScDgW27I8Ga0v01Po/c9+V1fnceoZPVXk3nFSE4mjOD5xZNPv3zjr2Te8Pr0jB8DdK7OiqjneboTFNqQb44GvL7QdISO6vOB7Z4/6TAPk5ACQyu/UvF8lFOZbr77xFKNYcPrFsgUA2N3IiGEEPuHvlHRO6d8dAHC20F17q05CPLSuh4f8AL6xGfiTuPW7Hk40Vzp79uIriWHqC4O5/QRdJVhzx/Ur3zgVC8eeWFPqDBKcf6j1qYI5nTEkl9yT2V9Ys0hOuIvYskHpWKrxCgcKB8xmPpA/xG/8ApmS5UbqUttYN5R6cNDXVjHqzz4ieinKXYRyJqZruCU7SXAvfikvn4+jbIaWWwzGcEAEOAQ7CjNuhJ8PNfmB3STqn+UAJTV60AG+N5YJbBKrtEsGOwYjrDg9kKTe4LZfhiaR+IEgfxPj5b+sFLRZJK0pVN1nAYkVcij5A0hhp22icAEukgUzx/Ydoyx0UC6lMoviXB90EUlg00/omSqZqrulnugAgcDTZ5QhnWcJJYjHF2whvLltQg055YDY0LrSztsGwn0iyCBkzOTpZEx3Di8RdXrPdLAUZ3hVpr4qKQgJWdaWt2J/OQoim0F+UNdIshYUDUKGTF34Qh0hoT8XB2JCTSl1R30F1Kc9pxaIa32Cja25HRlvmrBCvmKBSHvqKgSS2eD1DbqNhG90VokAJuS8alxmdpOAr5xjNEybiVTLrqFU6rAg+Jy7naU0Y5kQys2lZ01gpRSOeYpui+NoLfkqneT24NrZtHSUl58wFYY3U15AD3SD16SIF2TKIqfGBjwEZzRuiVrIW7k4Ma7R73w6s1uXIP4soq3pDqpty5RROQcY+p0v4Ym2pbrIbao4DZgcNsF2r4cTZ0jWcnClAwx9thHqfioAD5CgCSCQtLlnqAHGW/OCfimbfQmalTpNBsScW2h9hrSBjzcJ8WMtNXeBALatTz2Hh3iHw6DLUqWTQoSUmpFNUVOZGs2/rTKmmWSvY7cca7TEdFW55iCaArKQW/iBJxDgfh+UTiI/Eoyj2Cw0vh1VI0i3iYDk5YeZjxok9Tx9YUWNJKTgOcU2g63L1aLZOA97IrOfD28D4nIokjWHAR0oUFdn+MTkjWoMn7ftEkCgPD/GIYQVd3mOid3h0+8dFYJn7Vi/Ef9p9YsnB7289njyccD/ModjjHKwA3d4FeBcV2dWO3Lor6xcVY0zPX2TA0k47QCfIwSvBXXhQb9xgziM2jYGlKb8DspAOnZh1EliElSjldICig4bUgNQ60HzQGDNmO3HbCjSeuVKCgQxQReLv4nIZsQBj+bfGrlNPVWv0X+jMzSemjbqxZoRQSpNMXDbxVt0bayLUttZgGp9dsY9FkIKSKEeIZF6OIf2aezZvTyhhlyL6NAA5S+ZxGfLDptjrVLpxJqc+EAm1F7oJcMHGyLZc4sQG9tnA2Z10CTGZgfzPj6Z4QNNnFILXtwfqYtmKDlwjc7e/3hXpO00KUhDN3MWJWAbuJ7VPmTQoKvApzJGJ4iPNLWOYhpsgA30AkljdvJQVAIODCWo0yfIRdo7SCpS5aDLl3FkkqugqficMBDrSKCE3Ap7wDkFlJW5WmYA9E/MCUvkGBOEFFHN2MzYLGhSkva5bB1AIKXUTnVmesNxooPqJDlmKlAg7MCx2wrsVjkkFSpBWp3JSGer4gNtyEOJBVc1ULQAcFMM8jXLhBeZHkG2W1zpdFoLCobwjgIeWTTiFUI4sAdx91hDL0oUvqje5B5VMenSkokFY3GoAr9/OKpRt4hryDrdoiTM1kKbPFmPpEdF6Gmq8ajdehIambA54VMdo+2y1LaULyq4C9szwEN7eoy0OomorVzwP0gFFEuT4Ml8WaUSLsiS1KEgO1WNczSAZcwpCbrvRsQ9UvmPyhWbVOUXz1BazRgCekQTIfUUWBoHJLAhstxI4PFsVe5HBqvmuAraB0LGJoFeRbtCywKPyykkEpLMnAMxYY4VGMMJasd30eFLFQ+HVlHuNOHnrpRl2LJEwEJyFKf1BxHpGP6REbOz4UAV5/UxFS6qA2Ax5mXHIIBfAU4M2e6OlLoOI86x4k1r7oIikt384hkjG+Np7R7HOdsdAbg2M/aThT8x70j1ApvuktlgYrtaqD9Yfher6xKUoU6fXsYBcF5RJ8RfAsDwo/Z4LDAqTtD9iPQ9YGlTNbqPT1gmYitP4efiJHnFj5IPZlEg0pXl7EZ1KNYG6EnXUWzvKSACdo+UeDw6tavwFfpbLF28zCaxpKrpcl0h3bMlQoDsUmGHJYfLKXe359TBzefzRiGyBelsfEDTkYl8pQSHoymPmPKJ2XVvHOp9+8ovC3BGZTXh7HeNdre5kJg9qnKMslBZTnh7p3hMbXPObV8vLGNJZrObofaX6MPIwPNsiSaV9/tEE3EC1rLuoknL07RJNnI8SqnLHKmEMzYACAaY+6RCQRfYpdquqgbHDExKViGxZpicUUCTqh32XmB4UvRm9F6Tmf6qahTEBa1KLMcCk1xwamBYE4Axo9KrUsOVjXW4G4UGGWMZj4bWFW1ZNUzFKxwzIDscaDA4wEnaaLIRvF2NwJoIKwm89aqoxq+LbQWzyqImlS1UAloBDtq8chC6zky3SGUAdRVCCg1FQcCFDkYa2e0pugghsAGNCDg/Tttj0yRQikWQEPq1FW6EDrF9js0kYSQS4LkZxZZ5iXZ9ooPft4IlJCc3GwAeefCA0oLUx5KnJQnUSBQFgPrjhCHS9sWvfsc0qPrDC0WtIlh3fA1bfljGZXOKl6qSeL4c6xW9iYoKsMonOtMPdPvFGkrOq6oOA6SH3sRV9xEH2ZFGJqcBh++UCWtJBIDtQvQty3esWRRDe4Vouc6lKvAhd2ZvBUHYtnrJ7Q3s8zGuz+0xnrAkpWAVEm62DAlzs3gU4Q5kDbkw7EQt5vDTVUuq9hhyueqk49GGpUwP6Vbzi8eTRr7m9YhIF4EEY3h2MSBcv/I/IxlGj4kZRy3DyEeHEkZE+cSOOGQ2+9sRVisvn/iD6xDJQax39I6B6bPP6R0ATYT22iTuUnz+3ePQrCm3sRFVuOqo0o3YfeJKUwJwcHygVwWHiDrc4KwAr+VXcCsArDHnBiF0TuP8Ay2e6QYILpmc0opSA5VR2Y1vNvNID0dVQYMKs1QQNVPUBMS0yssmjgOaCjp8qJPWLtFSgFhLAXSlADNg3q8NmVw04ZPrdixmc9Vd9rIPskoqvJ2t1xgn5TKc44dPZj2yuJop/Ed2NOwhlMkPrcOGLx65SPFFA1oTtyA9+cKpkxvCKge8d0Oreqj7h5fWEK1EKLbWfhEx3OYJaF3VHbni9Pu8DWhJULwBBAyzfDziwTJhLuguc9le9IKKNQApZz+UvsApvJiwAz2lV3EX/AOBJYAhr3ib+1P8AXCWx6LVLlBSaLSygd4Yw/wBJyDMmCWfClifDg75VZS2OP/8ANmFYNl2ZwRujDzHFWqKMfA3Mvw36TlLxPRNTPlpWkVCQcUk3SWIuirJLochzdxiFiu4HgQ2OT8RXk+2PNCH5U5Ukh0rCikbyNdOwOAC+V1TVMdOlmXNIvUcsWLMrDlhj6Rs4auq1NSRkYii6VRxYzKbpNA7BvfSPV2tTF3GBIFP2rHrKUgAFBUHbGuGLmKFTWIvJxGIIOXasWNlSRETlF6Y+8c84Istlzc1fPocIoso12f8AaD5covsA9097Yqe4fBNUqu/39YXW4gO7OQae/OHabICm87gY7sfPbC61THYXXzxqPfrBxYDFiQUEPqMogOp3JAW/nSHgIrx9T9ITz1AEHKmDqLgkHKmMFpmUzGqKGmBIPfzjHzmnenGXR+/9GxlM7Tceq9htIWW2F1csTHqZlXAyHvv2iNiHh5uOVfKIyVhTXcHKf+k3T0IMLyNvxLjNr7GD7YgpTk8v7QYryzz8/vHg8RO77V6QMg0XXd56x0VXN57/AFjoEkW2sulVPyk82AMdO8L7RTmG8/WPF1TyPTMdohZVgoBZ2QPMfWIXAR5Ox97TBCplHG1HmBhzPeBlnsB5RcpP4RVuGHDz1XizoQLrYQZzOwAwIwvFL1wwXDbQ4vEE1LuDvJ/aERl/izVXbtQkKIOtQ554IqIfaLSzHAUJJem3Ae3h1ow+HSjHokJ1eeurKXVs0KLIFKvYEVpwaDU2QpSsl2Yvs2fSJaGMufJASSCHAUpgX/SDhXbsgudZ1lGBJAalH2jYK5HCAbuQk0Z21KuvewGBypkYzdqnKrw41NI0elZyk3kKuhz4XvE1zYMDzjN2pQQFHBOT1Vkw8ouprYrnyDyZRwDDeScndupwgpabqFKvNRhmAAMxgwoHyvPFUtgkqu611yVE4muEQt8y8qXJBFWKm/hABUeZUE70ndEV6qp03Jh0KTq1FBEbDZiEksxUxwZk0uhsmFWFHfbBllRXjFy+mI6NSIWUucfplCdKbm3J8sbowUYqK8ALSlkJcpopJCknYQXSeuXGPbUBOkiYlxTaaVOoSf4SCnfyg20B1Ee8TAeiEJFoVKVhMKijj+dIxNUgGjeFRMamV4jRU0Ph+5mZlh9dPWuV7C2VJUDeSSFCtKAhhiM8oIMqYtjltGzbtEaBegNf/du8AM8xXgYlP+H5qfAQpJqWDFx9oY5RF1TQns8oXjKBvEEXiaAcI1tksiSlKal6c/e+BrBKWhACZQUSDqqSMuTmGtj0zIJrOQZoHgAKSkb0mo2YRS1YsvcF0sn5YupDqIZtr0L84U6RsJSAHemXk3SNbI0cm98wqKjiNlYjbLBeTeAqH3HlERluQ1sfPkWBVWBNWd6AKBq0dZg6UlzUOSoEVcGj5eKHek5c4hVyT8zMBPWo2UhXKl2plfNSn5aVqCTQHIDVAoGP/bFOYQ14eVvP6bnqwFTTXjfy+o0sBw94g9YW6DQAZoGHzlDmwfzHSDLIoU4j372QBo21ATZstKQEpUpbvUqLBQ6hhwhTivlY0PkaE+Ucka2x/qYqIL8j5iJqVrHDLzP0iphIp+X7ePYuvj2I6B1BCvA4+yDl0iFlAEsbwXO4ftHOBUnL/FRHrFVk8IqalXmCGjrBFkxbthn5xcqYyMQwcnMUFXZzkXiieWHXzPvpFkxZEtRa8QDq7iGboe0enDw+JUjHq0UV56KcpdExHo2SS9wIYklSr6brk3Xcqo1wDc8auxpQkfiWqzo3JUZhZv4QE7N8Zg2SXMKb8qoAzcigKq8VKhvo/QMgsCpaTXwkHPMEQ41G/AUEkOZdtsKFXgq0TSElJCEJlpIILguxY7jnD3RtvmzH/wBOuTcJH4ahMvAZhQVMod6XEJUfDaCk/LtIvfzJGzcYS2zR1qklwXAOKVdeEeVtrkvVmtjR/EClIDqkpvYulTsXagUlJ2xlCRMIfa9aYGpxZzQCKF/Gs+WDLtMr56AcaBY4HA9uMN9GzLNatWyzhfAcyZrhR4ZsK11senspuLR5Z3i9xFa5ygovvNHLVDMBWmW4RZoRBUtU5Rcq1U0DXUkg4ZFV4/1Rbp7Rc5DLuBIVhUKatxDEULEhxmF7AYNsEm5KSkUCaf3H1EZGb1rJU0bWU0r3qehOaKEHaRveh974rlKrRvTfygmfLfOgr5/SAZQL9OuH16RgR4NwKWrXJ984U6eCkgTEFly1BSTvG1sqYZgw2mByG90H07QHpEXkK5eQ+8WQbTTQEldNGq0bb0WmzInppR2xKSKLRvYvxFdkMLNO3kivUR8p+GfiVViXOSUlSFpvhP8A4gID8CnH9KYo0l8QzrVMKPmps8l8XU5H5cHUqhG6G/D4hTppsUcVhHTqtLg+l6S+NbNINwEzZmSJYCi+QJyeL7Lo2fbk3raBLlu6JKQCvcVrLlJ3J+0YPQWnLBY3+TKXOWRWaoAF87r1SIcyP/yNMWCPkgBslF+rUjpyj4gQg1wbqT8IyEjUXaEUbVnK9Y6Zo/5OsLVq4ETyF0zuLdKknmRGDtfxBPnBr60pwuhR7nOFspKlCuVc/eUeb4iT2PRobW5sNLafssgj8Vc1Z/KhmZWFRSlaEkxjbNpv5swlEtKEKSl3NfzpSkDClCTCWdIWFm7WuNcHfPCJWFEwTUlSgku/hel8hny8UW3dSLj1QMYqElLobOxknLPgMyaQr0WgptVocHxUJwYlRB3wystBzOW8ZczFZtP465YHhCFO2ZK240CekJ6bSkhs8S2/XLA+Yixa9auYHmYqQADu+zxIqF5O8ev3inxLDy8vaI6J/LPsx5HHC5Qq52f4qjyzqJQP6vN6e84ksuK5gjsr7xTZzqJyx31Jf0PWCXBLJTywOwAnzp5RRpdP4YAF52di38RBce8IImnVKdrN/wBIHqYWaVnJIQCTS6qgScHOte/SWatdzjSy2GrER7Xf/h4Mxlpw8vT3CrDNCgSXDqXvoV0blDuyWck0L4Ntf1hNoqWoACjMkYADwkmg3uI1ejEXQVnEhhDPNCymWK0SUgG+SXDje7wBaPmJAFSz0x9OEaOzoYEnxHhs+sDWyzght2PvhHncS1SMLpSwJWSpPJyxJi/QtoDBBQEn+IXbwIORIoWdt7R2nHSpwd+fGFaLT8pRUfypUoh8QHNKjYaRdD5Vcrl82wdpfSpn2xMpI/Ds7EgO3zCBtP5EEjcVKoIbSxqCj3S3QkegjHfBcgrKlqJvzCVE4OVGpPc842iG+Wd4NOZbzhax1TXVbGbC0lTpKJxcsGNW+3n3gSSitR7xpBb0BywPDGBlHWNGx97Y8aXJ6i6a5usMG++ft4EtQx91YQVPoAWzHp94ptJxcb6828oIgw2lrOy079XrR+7wsRLZaXq4TyZw3CneNNp6zukkY1bu0I58q8sHIqNa+FQF3LYXjby+eqLRjZjG0kzpMquL+68YbaMkEvTKsC2OxpvJxJw6mnmOsaLRNjq3ase2SZnJjTROiyoO5pWnJ4dp0Q15OYDhs0mvNqcxB+hpQSkKADNh74wwtoNy+iq5etdzKPzp9RAKHUlyMjbtHXVEJTXaCKg8dxx+sIrZZJgIUlgFXg6qYpc3XYOCh+caXT6QofNlqLKS4I945fvGa0ipVxyplJri9EqSo0/STHshstjzy3Y4kTc6MW7gYdoEkl7TaXZwZI5XS/LGO0WXSxORHR04ZUAPCsFLs4vTJgopRQ523ajlWE/Ex+HVnHu/cbMPPXSjLsj2Zl+oj/tf1jx6iuX0rEFKIA3rL8btOGUeKW13p76GPIekIuq2+cdHfMPto6AuTYBAenLqSPWBLKlksSSQfT7CGCg2WY8xXpAElIdW4v1w86xbF7HMtU58x3H+IhPpBBK8El5ZFccUCm4hQhuvFhUfc/WEFtS846yhk2FQQdtaSxlmI2smjepKXRe/9GRm87U1Hqx3INaUGLDJ70aCxTcn3RmLOplHcH7iL/8AUKSLwHuv1hifAvG5TaAwc8OFTFE2aVOonaB0r73xnUaY1X94mGH+vTQEswHM4n6coq0hXsKtO2dwa6zFgcHo5I2YVEZS2F1Lq2osM+OqvfXPbhGh00slTgmtKbAKh+T8oRKSFCcf4QoDmyR3PeJqLTEOlvNIN+GZZSmWcHA5VDnhWNPIUSlQADBRHIUptyhLoWTdSgN4SzPv/aHVmQxIel4niDhChVldtjdFHqDSuTH0PZ4FX4uLZncMIJCRdOxubezA05LNjQM/CK1ySWWjwjljTBn3bOjRC0YjJ0+uPcRNfhpSh7nrgIiqqR7fGCT2I8RTaZV4Hf5inpGenWMAXiCwIfgl5YpwjXTpdeZHcffrCmchwpJwJPQopzvPGnlk/wBXT1Rm5nH9JS6MnYrPdNAzMX3MMNsMLNNAmEJ6tnWFkqY4ljMMnMYU+kWyQywQGcD7Qw6UL+o21gtYugu1A+44Zc4NOlEpVlTZt2d+8ZWxW5qEMxY8MBDCaQoDAsWPDLoWHSAdPcLWeaQtKZc1UtI1Jn4kvZrA30jc9eZ2RnbfNUGrqlSch4Vain4Uw2Qy0sAqUFI8Uk3k1yfw8HBpvhNPnKWaOQUltx8SW505xbGNkBfcM+GypUs36qfWwfC6cN6VV3jbDZCDcG9AfiAA/lSFuhpijNWlRDMFgBJBBLKqWD+JfSDSVJmMxu/KLnIkFCW4s56wrZrTtiG+qT/PoMuWzvQS6No9I/uT6xSfyk7YI/8Aj5h4pWmg4+zGSaRd83+aOjr/AOroI6B0nXBrRXllyH0gBCSkqD1fzLw0DK5g9wfrAK5f4inzHoWgoS2sSVrBFcgFdCJY9YRInArooKopT0o6igM2f4ZNdohza51xNWYYvhTF821YTBSfmLYBISAGTUUQFK465W0M2Sw+SUu9vp/ZgZxL54x7e/8AQxQr/cH8v+V70MTE9SaUoGI5VinRodVdin3smvnErYSAXo5YbCXdukbVtzFuWy7QHSCk8+PTbFl8TFOCQ5q/ce90eIRqAUJNTyw7+kTs0pKCV5VJ4kkV5v0iLE3K5syikE6/YezWAJNmIlr2KupFFOCV4g4fl4x7UrL+K8Mtpr3I6Q7sUoBKApmUsJP8pAZ+re6Dz4yWmjJ9j0YOOqtFdzrOSySAxKQWyBDBXceUM7CnDDAVxw2QJNRdc5gnY3Ibyl4JsRZmw9NvbzhQluhsLAA6hk5HLD0gKcHAKjVzQbaOebwZNqs72PKoiu3oo4O7mHDRC5OKQqmG/dkn1j1eCTvP9x9HidlIYOHH7n07RCWsFJGBTXrg3X7xK4OfJTNzyYjqaADrCueg32DVZ3bAHFJJDGowqcADhDieKE18JxbKoL9ObQv0ghlU4fmw8X5akG6zco9eBlprRZ5MbHVQkhbKlMU7UzGLc/VxBclYJSrBgR5bc3fpEJIBmqBxK0qzq6gWbnHiUC4HOIo3Ej07Q3CqE2rxlsDXDZl1ftELPbFIJAw2EtTE+seJZSUl3yP02bIonJUSA7OOGbP2PUxFiRmhbKxdJd/0kVPcHlC+RJMsqTecpUwxqDk43xXITMTR+e3lEJs7WQojA3FDgXHn2iVwCOdHUmI1lYlAAIKQXzOJLTBT+Uw0nDFsbv8Ax+9IRykhJUwCiChQCSAwYocktnd24CHy6kEZh+RvNhwEL2dQ/bPzRu5TP90fJgaywOxvKPFHLYr1eOlYM+KffkYrXgrg8L/ibhL5p2+UeRzjZHR2hnXDUSaAl9g7QvmJeY277QwTMOG/Pf6QstPjB206GBgSUzpb0oxKXO7BVM/FntqIztiqlUw0MwlbMH1iVDspuUPrd4FKC2ZJDB3JULieLKWmEk8BLhOAF0cqDCHHKYacMu9xWzOerENdLB+iU6xfC4S42lgOxEGKYgIUPF55eftop0aSUrUKAsnyOzBhFRtgKj+UpScaYu1eYjTM9hc9aVKLUoc8AyQIGtzgXEqVqgO9dZTDybrF8pAcFwKZAbDnyEATXYl2JU3c744g9kBylKk4kORxYOOfaHySFJReo4WouQTecNhCmyO4G4gUJqBQ6tSX2Qcut2jaiQWaigSkswAyGQjNzR/oNfnJoZbG9dMZzS58O1BD0BADF94uNxMQkzKg5n/kQwJrmYgqY6O/ME3W5JUOSYiAAGzBLMMdnsQrvgZgm0IZQHvJx2MQtJJSWZs8NoNOrftFlrBISo8Po/XtAwJY7/oqBT4OJWfwt+3vHrHkpb72JI3Ph5mkQklwc+m/Zwj2R4rp/cen3g+pB6gM2Qw9e/rAtrTeDNibrHb4Tygk4HHF+Rr1r2im20SoihYtx8b9SRyg6UtM0+jAqR1QceqB03ROCksQWIOTAlIZiRglLYwMHKVVa6c4MQgKUKuWIDXnASGALkvnurQBmhcicSF/0luLgw5wd0J8luXSpRALkMDuFMfIY8I8tLC6RWuDZHEA5vFa5ajXaBh/KN+GEerlugPspsau/Y0SQci3l+GNTiDF1oQ95q32Iy9m8feYiEa1B4qZ41rg8MJkpQCAoNQg5b+7e6xNiLlFgmqUoJYawUlqBRU19Df1BNTGlkvdRqtqs2NBfAc/9PeMzZJvy1hWwhXQ6z1pTyEPbFJTLBQAWSs1Owsxqf4QDGXm1LVh2+jT+33NHLKmmul12+5UlV0B8w23EsPSIkY7G+kWFD0IwV5ffyit3PXzhTY0A3zf5j3jotcbO8dB6iLBExdG94EwHbV4bXJ31SSO4g5SXD7IX2+h506fcxVC1yWUW1dxF4mhJN39Lk/3S1dISSVOknF/vDHTU0aqFEE1VQUYgBNcyUFP/TCuSgEJBz6tyh8wsPh0ox6ITcRPXVlLuOrOyZW8qfDOveFqkupVK0GGzH06wxtKGSkCoqacADSA7NLqHxqTXe8XFIbJvBK8mFG2U+sL5xoneAe/nnBxmEy1K2jDbX79oDT+Wj0iSAuySrzjMg0PLaDSuYMMJk5IUSTqm6Q2LFCVOeZPSAZcuoGLENjk5VhhRsadYMkygpSy7C+pIOQCSQOTCMfN5WppdzXymN6jfYMsTF9me8KAUPXrHIohNKhLVxcMH7GIWBTEp3BPFqg9HHKCJhx5eoPctyhdZvkiHl0+9MfSIKT4eIc82+sdIGo5ByAZ827xWokgAZt5Uy3wK2OKELY+8scfdIsQxmXS7tvwYvXpFYOseP7HvEfmETEkbwOZU3pB+IL4LkrwdgSK+RHKsdNDhzQkPXv59o5asFAY1647sY5aicGr9KPzA7RAQJYTQE7wKnAJriS1VgUA5kwtsqakY3XDbgadKiG1hAIU5wJpXAuo0wyArCsTGnKG04EYEh2hyw89VJPsKGIjpqyXcInrYJA2F+D09I8sk9LJKgW/eKJkwUrlR+3OnWKUzKZHjvrF5QOrRa5aQLgHHf7aBrXbXrXF24gP9OcKFyiogYMWxg5KD8uuLEN0w6R12dZA80l0v4SReOTGhPnGmskxShLNSky0pLVAUghJB4ACM98g1BwFaciIc6KIWgMq78uaGqdYTEguTxADnZFOIp66co9Uy6hU0TUujQYFMVfqbq31iks5c7fU/SLkLq/6T76QPNUznj5AwijijvlDaehjopve6/SPImxwwlKdPvZC63SlKICWcqSA+1w0GyvCRuHmfvA01RCnOCUlROxgwPG8U9YswkNVaMe6K689FOUuzMzpOamYuYpJLYJFaDEDgC46QMkssNkB0p9I9lzHSBtY83fzpF8u6TeNCCB9Ye0hNuHkqAQFOHApxzimWQq8oFiaDg32gucD8tJarHoAEnuYEM26K4Uw90zjjgiUrUI2FLdFfaKPmEHDA48aQdZJiFyzkb1QaCgOPXtA6JDuXDUHWkEgQjRq9cl6AlTOcNVJoCxpexGxs4LscomWgKo6STvJOPnA1lRqHEapZ2aoY0csbyhkMuMG3QQyiRkOBZ+RyheziV5Rj5s38pjaMn5HYFNXfVKtrtdV1I6xNS3L5tiNusPQRQUEIIfwtdVtBvEdKRO0aqhR8edSR5RkGsGWVXiTnu2jCvMRQpVO/Q8d8WSZjL2V9+YiEwM448uvKAscDWlTKyDj9/SKbRNKWIpgx4fbyi61YA190r0J90qtqXQC2Aw7+kSnujmtmEIOqRsUTnkxy4ngwj0GtBXGkU2Fepnkavgx7Fxyiz5lR6+sS1vYlPY8saBfWktUpA4FQfhRJgBcsJXXFRGP8Lt1BennBslJM03HJUm6BxITmRtOfWJaRuCaDe3NkwYiubh4aMtlqoIWMxjprsWz5TBPPZgD0GMU2WXqsaFwe7H07w5tBSQM2JHVn7nbkYEQnxYDfvIb0PSPeeEpuJq5zpwp6xbLSCngoYB9rmudOwgFanOGeex/pFmjppuzE1yV/wBwHXWMcdYuRJAPEN5jbtaL/h5F5S5RN0TEljsVLImAca0gMzze34/eLNHzbsxK1LYCYkkZEHVU/KIZKG/zB8xYCgQ5GxnAIbcyk1j20Kq1IgtKknXTdIUUls2wNDg10co9tIwbh5QkYyHw68o9xwws9dGMuwLf3x7FtzePfKOjzXL7BEsMOlOLvCvTamlTCDW6lDZa5xfdWm7dB5Gb/wANeDwtt0wKTcqFFd4OCzIvAMeN8cGMamT0teI1dDOzSrpo26iNUlRIYtq0GxiInJsxWwo7EnicO0cqYAsjKgB2bO8E2VABfMqpwozdYbrCxcLmyFploD1IyfAkl+8B2h2FQ9aYvtd40GkFOEbAmjZsVeiRABkyhQqGqBifrw8olROuBy7CtaGahViaFmZvKIWXRTMkrN9WAJLEufQFob2oKISlIF1JZ/5qEmAFTCqckqqx1WaikpN3CpdQT1iGkchhNDUIYllAMzEqFCHP8PfAYRTa7SEEXnW7tdOAG3m45R1sn/ikISWICkBki7SrtQMVE8Yrl2SWjBKiG8VcMQx6Qs5nJOtbol/kZMtjajfq3/gOSxlkO7J1TtGIPaJWw0BAY1Pd/J4rsjDVyHhO1Je75t/TEFZfpbHMY94zrbmgEIU7H27fUQROWCScXY+vSFtnNMOm7/6q6wStTgcx+/KIOZG1USfrxB7t1iha3l0xD9N3InpF6jQ4exAyEuOvkn6GIRJXoucoKIJ1WcGtM25MILmAhVKMcyDjw4gQusSx85ug3VIhiti+Xbax9/sc+QY8HsiaPmpO5QYfpUW6gQq0zNK1X0kUIZjkEpAIY7QrDZvhjeIKVbw7bDT1MDW2Qq7+kEBmAPy16xoAK/My2dd3KJXptdzDzaNpp9ihE0i84bA9Xxy/M/LHBibFNYkkDEdXr2cc4hNDBKmegpnR+0U2UALumusQ9ags2G6NhGSSmyQCGwvNwchojo6Qpyk5gjsWrxaC7QQx24jaw9nvHKtgQoKYAO/Iex0gtgSCrKWDb/I/QmBPkhQY1e8lhi9WpxA6QWvSSaIcaqm3vUeoruhf84pSpQBdNQ2P1H7wJJp5ir8uXMAIvBJrQuzKO/WxbY2RimeaBsPPH6RP4ftomyJiEg6qlMDsYTEHjeJ6bq0Tnu+9n7wq5zTtWUuq9vxDJlVS9Jx6P3JXeHWOga9u846MixqBOXI+cZ5X/wCyP/IX5Kjo6N7JOZ+n3MbOOI+v2BU+JfL0i5WMvl6x7HQyGAM5vgl8B/lCOV/uDiPNMdHQL4CRptHeE/1eRhfK8a//AC1+SY6Ogv4sFfuCF/7039CP7UwxHg6+Zjo6FTMP+xL09kNGA/4I+vuwKX4B+geUyLF+M/pX5mOjo8h7DyzZ/qglOB/T6COjoF8nHD83OAk+ER7HRCOAJH+8YcTPAPeSo8josnyvIiPBSfAOJ8zHuksJv6l/+3HR0bGT/wAvzqY+b/x/OhVJy4DzMBWbxS+Ev/00x5HRuGIStmfP1gO1Yf0q/uEex0Q+DkCSvFM/UqHCfDM/SPNMdHQMSZDn4H8S+Ej+y0R4rDn9I6Ohfz7mHr9jdybifp9wWOjo6MA2j//Z',
  },
  {
    id: '#111113',
    nome: 'Vestido midi',
    cor: 'preto',
    tamanho: 'P',
    preco: 120,
    status: 'a entregar',
    imagem: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2k6sPwV32F3P7zN7w-zhVyAQyWDWzoXFb9NYimABGIw&s=10',
  },
]

// 🔥 STATE
const pedidos = ref<Pedido[]>([])

// 🔥 LOAD
async function loadPedidos() {
  try {
    const token = localStorage.getItem('token')

    const res = await axios.get(`${API}/api/pedidos/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('pedidos:', res.data)

    const data = res.data

    const pedidosAPI = Array.isArray(data)
      ? data
      : data.results || data.items || []

    // 👉 se API vazia → usa mock
    if (pedidosAPI.length === 0) {
      pedidos.value = pedidosMock
    } else {
      pedidos.value = pedidosAPI
    }

  } catch (error) {
    console.error('Erro ao carregar pedidos:', error)

    // 👉 se erro → usa mock
    pedidos.value = pedidosMock
  }
}

// 🔥 INIT
onMounted(() => {
  loadPedidos()
})

// 🔥 FUNÇÕES
function abrirPedido(id: string) {
  router.push(`/pedido/${id}`)
}

function statusClass(status: string) {
  switch (status) {
    case 'entregue':
      return 'green'
    case 'cancelado':
      return 'gray'
    case 'a entregar':
      return 'blue'
    default:
      return 'red'
  }
}
</script>

<template>
  <div class="pedidos-page">

    <div class="header">
      <span
        class="material-symbols-outlined back"
        @click="$router.back()"
      >
        arrow_back
      </span>

      <h2>MEUS PEDIDOS</h2>
    </div>

    <!-- 🔥 SE NÃO TIVER PEDIDOS -->
    <div v-if="pedidos.length === 0" class="empty">
      Nenhum pedido encontrado 🛍️
    </div>

    <!-- 🔥 LISTA -->
    <div
      v-for="pedido in pedidos"
      :key="pedido.id"
      class="pedido-card"
      @click="abrirPedido(pedido.id)"
    >
      <img :src="pedido.imagem || 'https://via.placeholder.com/80'" />

      <div class="info">
        <span class="id">ID: {{ pedido.id }}</span>

        <h3>{{ pedido.nome }}</h3>

        <p>
          {{ pedido.cor }} | {{ pedido.tamanho }}
        </p>

        <strong>R$ {{ pedido.preco }}</strong>
      </div>

      <div :class="['status', statusClass(pedido.status)]">
        {{ pedido.status }}
      </div>
    </div>

  </div>
</template>

<style scoped>
.pedidos-page {
  background: var(--surface-elevated);
  min-height: 100vh;
  font-family: "Montserrat", sans-serif;
}

.header {
  background: var(--surface-bg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.back {
  cursor: pointer;
}

.empty {
  text-align: center;
  padding: 40px;
  color: gray;
}

.pedido-card {
  background: var(--surface-bg);
  display: flex;
  padding: 15px;
  gap: 15px;
  border-bottom: 1px solid #eee;
  position: relative;
  cursor: pointer;
}

.pedido-card img {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
}

.info {
  flex: 1;
}

.id {
  font-size: 12px;
  color: gray;
}

.info h3 {
  margin: 5px 0;
  font-size: 15px;
}

.info p {
  color: var(--text-muted);
  font-size: 13px;
}

.info strong {
  color: #ff5a5a;
}

.status {
  position: absolute;
  right: 15px;
  top: 15px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 11px;
}

.green {
  background: #dff7e2;
  color: green;
}

.gray {
  background: var(--surface-elevated);
  color: gray;
}

.blue {
  background: #dbeeff;
  color: #007aff;
}

.red {
  background: #ffdede;
  color: red;
}
</style>