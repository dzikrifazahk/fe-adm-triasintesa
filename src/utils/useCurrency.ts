import { useState, useEffect } from "react";

export function formatRupiah(angka: string | number) {
  let number_string = String(angka).replace(/[^,\d]/g, '').toString(),
      split = number_string.split(','),
      sisa = split[0].length % 3,
      rupiah = split[0].substr(0, sisa),
      ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    let separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }

  rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
  return rupiah;
}

export function normalizeRupiah(angka: string) {
  // Menghapus titik (.) dan koma (,) yang ada di format uang
  let number_string = angka.replace(/[^0-9]/g, '');
  
  // Mengembalikan string yang telah dinormalisasi menjadi angka
  return parseInt(number_string, 10);
}

export function useCurrencyInput() {
  const [value, setValue] = useState<string>(''); // Raw value (numeric)
  const [formattedValueNumeric, setFormattedValueNumeric] = useState<string>(''); // Formatted value without "Rp."
  const [formattedValueWithRp, setFormattedValueWithRp] = useState<string>(''); // Formatted value with "Rp."

  useEffect(() => {
    // Format the numeric value without "Rp." for the numeric display
    const formattedNumeric = formatRupiah(value);

    // Format the value with "Rp." symbol for the currency display
    const formattedWithRp = `Rp. ${formattedNumeric}`;

    setFormattedValueNumeric(formattedNumeric);
    setFormattedValueWithRp(formattedWithRp);
  }, [value]); // Re-run whenever 'value' changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Remove non-numeric characters except commas (for the decimal point)
    const numericValue = inputValue.replace(/[^0-9,]/g, '');

    setValue(numericValue);
  };

  return {
    value, // Raw numeric value (can be used for calculations or form submissions)
    formattedValueNumeric, // Formatted value (without "Rp.") for display
    formattedValueWithRp, // Formatted value with "Rp." for display
    handleChange, // Change handler for the input
    setValue, // Expose the setValue function for updating the raw value
  };
}
