import { useEffect, useState } from 'react';
import { buscarRota, type RotaRuas } from '@/services/rotas';
import type { Coordenadas } from '@/shared/utils';

export type EstadoRota = { status: 'carregando' } | { status: 'ok'; rota: RotaRuas } | { status: 'erro'; mensagem: string };

/**
 * Rota pelas ruas do imóvel até o campus (OSRM).
 * `atrasoMs` evita consultas enquanto o usuário só passa o mouse pelos cards da busca.
 */
export function useRotaAteCampus(imovel?: Coordenadas, campus?: Coordenadas, { atrasoMs = 0 } = {}): EstadoRota | undefined {
  const [estado, setEstado] = useState<EstadoRota>();
  const [lat1, lng1, lat2, lng2] = [imovel?.latitude, imovel?.longitude, campus?.latitude, campus?.longitude];

  useEffect(() => {
    if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
      setEstado(undefined);
      return;
    }
    let cancelado = false;
    setEstado({ status: 'carregando' });
    const timer = setTimeout(() => {
      buscarRota({ latitude: lat1, longitude: lng1 }, { latitude: lat2, longitude: lng2 })
        .then((rota) => !cancelado && setEstado({ status: 'ok', rota }))
        .catch((err: unknown) => {
          if (!cancelado) setEstado({ status: 'erro', mensagem: err instanceof Error ? err.message : 'Rota indisponível.' });
        });
    }, atrasoMs);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [lat1, lng1, lat2, lng2, atrasoMs]);

  return estado;
}
